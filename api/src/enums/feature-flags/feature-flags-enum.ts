// List of feature flags
// Note, these are just used to keep backend and frontend in sync. We store feature flags as strings so this list might not include every flag
export enum FeatureFlagEnum {
  example = 'example', // sample feature flag for testing purposes
  enableHomeType = 'enableHomeType',
  enableAccessibilityFeatures = 'enableAccessibilityFeatures',
  enableUtilitiesIncluded = 'enableUtilitiesIncluded',
  hideCloseListingButton = 'hideCloseListingButton',
  enableRegions = 'enableRegions',
}
