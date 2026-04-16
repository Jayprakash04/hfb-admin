"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { brokerFormSchema, type BrokerFormValues, defaultBrokerValues } from "../../lib/broker-schema";
import { RegulationEnum, AccountTypeEnum, PlatformEnum } from "../../lib/enums";
import { brokerService } from "../../services/api";
import Input from "../form/Input";
import Textarea from "../form/Textarea";
import Checkbox from "../form/Checkbox";
import MultiSelect from "../form/MultiSelect";
import DynamicListInput from "../form/DynamicListInput";
import SectionWrapper from "../form/SectionWrapper";

interface BrokerFormProps {
  mode: "create" | "edit";
  initialData?: Partial<BrokerFormValues>;
  brokerId?: string;
  onSuccess?: () => void;
}

export default function BrokerForm({ mode, initialData, brokerId, onSuccess }: BrokerFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BrokerFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(brokerFormSchema) as any,
    defaultValues: { ...defaultBrokerValues, ...initialData },
  });

  const nameValue = watch("name");
  const shortDescValue = watch("shortDescription");

  // Auto-generate slug from name
  useEffect(() => {
    if (mode === "create" && nameValue) {
      const slug = nameValue
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setValue("slug", slug);
    }
  }, [nameValue, mode, setValue]);

  const onSubmit = async (data: BrokerFormValues) => {
    try {
      if (mode === "edit" && brokerId) {
        await brokerService.update(brokerId, data);
        toast.success("Broker updated successfully!");
      } else {
        await brokerService.create(data);
        toast.success("Broker created successfully!");
      }
      onSuccess?.();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || `Failed to ${mode} broker`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
      {/* ── Basic Information ── */}
      <SectionWrapper title="Basic Information" description="Core broker identity and description">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Broker Name"
            required
            placeholder="e.g. XM Global"
            register={register("name")}
            error={errors.name}
          />
          <Input
            label="Slug"
            required
            placeholder="auto-generated"
            register={register("slug")}
            error={errors.slug}
            readOnly={mode === "create"}
          />
        </div>
        <Input
          label="Logo URL"
          placeholder="https://example.com/logo.png"
          register={register("logo")}
          error={errors.logo}
        />
        <Controller
          control={control}
          name="shortDescription"
          render={({ field }) => (
            <Textarea
              label="Short Description"
              placeholder="Brief overview of the broker (max 300 chars)"
              maxLength={300}
              charCount={shortDescValue?.length ?? 0}
              maxChars={300}
              register={field}
              error={errors.shortDescription}
            />
          )}
        />
        <Controller
          control={control}
          name="fullDescription"
          render={({ field }) => (
            <Textarea
              label="Full Description"
              placeholder="Detailed broker description..."
              rows={6}
              register={field}
              error={errors.fullDescription}
            />
          )}
        />
      </SectionWrapper>

      {/* ── Regulation Details ── */}
      <SectionWrapper title="Regulation Details" description="Regulatory bodies and license information">
        <Controller
          control={control}
          name="regulatoryBodies"
          render={({ field }) => (
            <div className="relative">
              <MultiSelect
                label="Regulatory Bodies"
                options={[...RegulationEnum]}
                value={field.value}
                onChange={field.onChange}
                error={errors.regulatoryBodies?.message}
              />
            </div>
          )}
        />
        <Controller
          control={control}
          name="licenseNumbers"
          render={({ field }) => (
            <DynamicListInput
              label="License Numbers"
              value={field.value}
              onChange={field.onChange}
              placeholder="Enter license number"
            />
          )}
        />
        <Controller
          control={control}
          name="isRegulated"
          render={({ field }) => (
            <Checkbox
              label="Is Regulated"
              description="Check if this broker is regulated by official bodies"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </SectionWrapper>

      {/* ── Company Info ── */}
      <SectionWrapper title="Company Info" description="Founding details and headquarters">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Founded Year"
            type="number"
            placeholder="e.g. 2009"
            register={register("foundedYear", { valueAsNumber: true })}
            error={errors.foundedYear}
          />
          <Input
            label="Headquarters Country"
            placeholder="e.g. Cyprus"
            register={register("headquartersCountry")}
            error={errors.headquartersCountry}
          />
        </div>
      </SectionWrapper>

      {/* ── Status ── */}
      <SectionWrapper title="Status" description="Visibility and featuring options">
        <div className="flex flex-wrap gap-8">
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <Checkbox
                label="Active"
                description="Broker visible on the platform"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="isFeatured"
            render={({ field }) => (
              <Checkbox
                label="Featured"
                description="Show on homepage featured section"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </SectionWrapper>

      {/* ── Trading Conditions ── */}
      <SectionWrapper title="Trading Conditions" description="Spreads, leverage, platforms and account types">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Minimum Deposit ($)"
            type="number"
            placeholder="0"
            register={register("tradingConditions.minDeposit", { valueAsNumber: true })}
            error={errors.tradingConditions?.minDeposit}
          />
          <Input
            label="Max Leverage"
            placeholder="e.g. 1:888"
            register={register("tradingConditions.maxLeverage")}
            error={errors.tradingConditions?.maxLeverage}
          />
          <Input
            label="Spread From (pips)"
            type="number"
            step="0.1"
            placeholder="0"
            register={register("tradingConditions.spreadFrom", { valueAsNumber: true })}
            error={errors.tradingConditions?.spreadFrom}
          />
          <Input
            label="Commission Per Lot ($)"
            type="number"
            step="0.01"
            placeholder="0"
            register={register("tradingConditions.commissionPerLot", { valueAsNumber: true })}
            error={errors.tradingConditions?.commissionPerLot}
          />
        </div>

        <Controller
          control={control}
          name="tradingConditions.accountTypes"
          render={({ field }) => (
            <div className="relative">
              <MultiSelect
                label="Account Types"
                options={[...AccountTypeEnum]}
                value={field.value}
                onChange={field.onChange}
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="tradingConditions.platforms"
          render={({ field }) => (
            <div className="relative">
              <MultiSelect
                label="Platforms"
                options={[...PlatformEnum]}
                value={field.value}
                onChange={field.onChange}
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="tradingConditions.baseCurrencies"
          render={({ field }) => (
            <DynamicListInput
              label="Base Currencies"
              value={field.value}
              onChange={field.onChange}
              placeholder="e.g. USD, EUR, GBP"
            />
          )}
        />

        <Controller
          control={control}
          name="tradingConditions.instruments"
          render={({ field }) => (
            <DynamicListInput
              label="Instruments"
              value={field.value}
              onChange={field.onChange}
              placeholder="e.g. Forex, CFDs, Crypto"
            />
          )}
        />

        <div className="flex flex-wrap gap-8">
          <Controller
            control={control}
            name="tradingConditions.hasIslamicAccount"
            render={({ field }) => (
              <Checkbox
                label="Islamic Account"
                description="Swap-free account available"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="tradingConditions.hasDemoAccount"
            render={({ field }) => (
              <Checkbox
                label="Demo Account"
                description="Free demo account available"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </SectionWrapper>

      {/* ── Pros & Cons ── */}
      <SectionWrapper title="Pros & Cons" description="Advantages and disadvantages of this broker">
        <Controller
          control={control}
          name="pros"
          render={({ field }) => (
            <DynamicListInput
              label="Pros"
              value={field.value}
              onChange={field.onChange}
              placeholder="Add a pro..."
            />
          )}
        />
        <Controller
          control={control}
          name="cons"
          render={({ field }) => (
            <DynamicListInput
              label="Cons"
              value={field.value}
              onChange={field.onChange}
              placeholder="Add a con..."
            />
          )}
        />
      </SectionWrapper>

      {/* ── Contact Information ── */}
      <SectionWrapper title="Contact Information" description="Official contact details and social links">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Website"
            type="url"
            placeholder="https://example.com"
            register={register("contact.website")}
            error={errors.contact?.website}
          />
          <Input
            label="Email"
            type="email"
            placeholder="support@example.com"
            register={register("contact.email")}
            error={errors.contact?.email}
          />
          <Input
            label="Phone"
            placeholder="+1 234 567 890"
            register={register("contact.phone")}
            error={errors.contact?.phone}
          />
          <Input
            label="Live Chat URL"
            type="url"
            placeholder="https://livechat.example.com"
            register={register("contact.liveChatUrl")}
            error={errors.contact?.liveChatUrl}
          />
          <Input
            label="Twitter"
            type="url"
            placeholder="https://twitter.com/broker"
            register={register("contact.twitter")}
            error={errors.contact?.twitter}
          />
          <Input
            label="Facebook"
            type="url"
            placeholder="https://facebook.com/broker"
            register={register("contact.facebook")}
            error={errors.contact?.facebook}
          />
          <Input
            label="LinkedIn"
            type="url"
            placeholder="https://linkedin.com/company/broker"
            register={register("contact.linkedin")}
            error={errors.contact?.linkedin}
          />
        </div>
      </SectionWrapper>

      {/* ── Ratings ── */}
      <SectionWrapper title="Ratings" description="Aggregate rating values">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Rating Average (0-5)"
            type="number"
            step="0.1"
            min="0"
            max="5"
            placeholder="0"
            register={register("ratingAverage", { valueAsNumber: true })}
            error={errors.ratingAverage}
          />
          <Input
            label="Rating Count"
            type="number"
            min="0"
            placeholder="0"
            register={register("ratingCount", { valueAsNumber: true })}
            error={errors.ratingCount}
          />
        </div>
      </SectionWrapper>

      {/* ── Affiliate ── */}
      <SectionWrapper title="Affiliate" description="Affiliate tracking and CPA configuration">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Affiliate URL"
            type="url"
            placeholder="https://affiliate.example.com"
            register={register("affiliateUrl")}
            error={errors.affiliateUrl}
          />
          <Input
            label="Affiliate CPA Value ($)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0"
            register={register("affiliateCpaValue", { valueAsNumber: true })}
            error={errors.affiliateCpaValue}
          />
        </div>
      </SectionWrapper>

      {/* ── SEO ── */}
      <SectionWrapper title="SEO" description="Search engine optimization fields">
        <Input
          label="Meta Title"
          placeholder="SEO title for search engines"
          register={register("seo.metaTitle")}
          error={errors.seo?.metaTitle}
        />
        <Controller
          control={control}
          name="seo.metaDescription"
          render={({ field }) => (
            <Textarea
              label="Meta Description"
              placeholder="SEO description for search engines"
              rows={3}
              register={field}
              error={errors.seo?.metaDescription}
            />
          )}
        />
        <Controller
          control={control}
          name="seo.metaKeywords"
          render={({ field }) => (
            <DynamicListInput
              label="Meta Keywords"
              value={field.value}
              onChange={field.onChange}
              placeholder="Add a keyword"
            />
          )}
        />
      </SectionWrapper>

      {/* ── Tags ── */}
      <SectionWrapper title="Tags" description="Categorization tags for filtering">
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <DynamicListInput
              label="Tags"
              value={field.value}
              onChange={field.onChange}
              placeholder="Add a tag"
            />
          )}
        />
      </SectionWrapper>

      {/* ── Submit ── */}
      <div className="flex items-center gap-4 mb-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-yellow-400 text-black text-sm font-bold uppercase rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              {mode === "edit" ? "Updating..." : "Creating..."}
            </span>
          ) : mode === "edit" ? (
            "Update Broker"
          ) : (
            "Create Broker"
          )}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-8 py-3 border-2 border-[#E5E7EB] text-gray-600 text-sm font-bold uppercase rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
