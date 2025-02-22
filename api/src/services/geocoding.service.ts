import { FeatureCollection, Polygon, point } from '@turf/helpers';
import buffer from '@turf/buffer';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { MapLayers, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { Application } from '../dtos/applications/application.dto';
import Listing from '../dtos/listings/listing.dto';
import { MultiselectOption } from '../dtos/multiselect-questions/multiselect-option.dto';
import { ApplicationMultiselectQuestion } from '../dtos/applications/application-multiselect-question.dto';
import { PrismaService } from './prisma.service';
import { ValidationMethod } from '../enums/multiselect-questions/validation-method-enum';
import { ApplicationMultiselectQuestionOption } from '../dtos/applications/application-multiselect-question-option.dto';
import { Address } from '../dtos/addresses/address.dto';
import { InputType } from '../enums/shared/input-type-enum';
import pointsWithinPolygon from '@turf/points-within-polygon';

@Injectable()
export class GeocodingService {
  constructor(private prisma: PrismaService) {}

  public async validateGeocodingPreferences(
    application: Application,
    listing: Listing,
  ) {
    let preferences = application.preferences;
    preferences = this.validateRadiusPreferences(preferences, listing);
    preferences = await this.validateGeoLayerPreferences(preferences, listing);

    await this.prisma.applications.update({
      where: { id: application.id },
      data: { preferences: preferences as unknown as Prisma.InputJsonObject },
    });
  }

  verifyRadius(
    preferenceAddress: Address,
    radius: number,
    listingAddress: Address,
  ): boolean | null {
    try {
      if (preferenceAddress.latitude && preferenceAddress.longitude) {
        const preferencePoint = point([
          Number.parseFloat(preferenceAddress.longitude.toString()),
          Number.parseFloat(preferenceAddress.latitude.toString()),
        ]);
        const listingPoint = point([
          Number.parseFloat(listingAddress.longitude.toString()),
          Number.parseFloat(listingAddress.latitude.toString()),
        ]);
        const calculatedBuffer = buffer(listingPoint.geometry, radius, {
          units: 'miles',
        });
        return booleanPointInPolygon(preferencePoint, calculatedBuffer)
          ? true
          : false;
      }
    } catch (e) {
      console.log('e', e);
      console.log('error happened while calculating radius');
    }
    return null;
  }

  verifyLayers(
    preferenceAddress: Address,
    featureCollectionLayers: FeatureCollection,
  ): boolean | null {
    try {
      if (preferenceAddress.latitude && preferenceAddress.longitude) {
        const preferencePoint = point([
          Number.parseFloat(preferenceAddress.longitude.toString()),
          Number.parseFloat(preferenceAddress.latitude.toString()),
        ]);

        const points = pointsWithinPolygon(
          preferencePoint,
          featureCollectionLayers as FeatureCollection<Polygon>,
        );
        if (points && points.features?.length) {
          return true;
        }

        return false;
      }
    } catch (e) {
      console.log('e', e);
    }
    // If the geocoding value was not able to be verified we need to set it as "unknown"
    // in order to signify we are unable to automatically verify and manually checking will need to be done
    return null;
  }

  /**
   * Checks if there are any preferences that have a validation method of radius, validates those preferences addresses,
   * and then adds the appropriate validation check field to those preferences
   *
   * @param preferences
   * @param listing
   * @returns the preferences with the geocoding verified field added to preferences that have validation method of radius
   */
  public validateRadiusPreferences(
    preferences: ApplicationMultiselectQuestion[],
    listing: Listing,
  ): ApplicationMultiselectQuestion[] {
    // Get all radius preferences from the listing
    const radiusPreferenceOptions: MultiselectOption[] =
      listing.listingMultiselectQuestions.reduce(
        (options, multiselectQuestion) => {
          const newOptions =
            multiselectQuestion.multiselectQuestions.options?.filter(
              (option) => option.validationMethod === ValidationMethod.radius,
            );
          return [...options, ...newOptions];
        },
        [],
      );
    // If there are any radius preferences do the calculation and save the new preferences
    if (radiusPreferenceOptions.length) {
      const newPreferences: ApplicationMultiselectQuestion[] = preferences.map(
        (preference) => {
          const newPreferenceOptions: ApplicationMultiselectQuestionOption[] =
            preference.options.map((option) => {
              const addressData = option.extraData?.find(
                (data) => data.type === InputType.address,
              );
              if (option.checked && addressData) {
                const foundOption = radiusPreferenceOptions.find(
                  (preferenceOption) => preferenceOption.text === option.key,
                );
                if (foundOption) {
                  const geocodingVerified = this.verifyRadius(
                    addressData.value as Address,
                    foundOption.radiusSize,
                    listing.listingsBuildingAddress,
                  );
                  return {
                    ...option,
                    extraData: [
                      ...option.extraData,
                      {
                        key: 'geocodingVerified',
                        type: InputType.text,
                        value:
                          // If the geocoding value was not able to be verified we need to set it as "unknown"
                          // in order to signify we are unable to automatically verify and manually checking will need to be done
                          geocodingVerified === null
                            ? 'unknown'
                            : geocodingVerified,
                      },
                    ],
                  };
                }
              }
              return option;
            });
          return { ...preference, options: newPreferenceOptions };
        },
      );
      return newPreferences;
    }
    return preferences;
  }

  /**
   * Checks if there are any preferences that have a validation method of 'map', validates those preferences addresses,
   * and then adds the appropriate validation check field to those preferences
   *
   * @param preferences
   * @param listing
   * @returns all preferences on the application
   */
  public async validateGeoLayerPreferences(
    preferences: ApplicationMultiselectQuestion[],
    listing: Listing,
  ): Promise<ApplicationMultiselectQuestion[]> {
    // Get all map layer preferences from the listing
    const mapPreferenceOptions: MultiselectOption[] =
      listing.listingMultiselectQuestions?.reduce(
        (options, multiselectQuestion) => {
          const newOptions =
            multiselectQuestion.multiselectQuestions?.options?.filter(
              (option) => option.validationMethod === ValidationMethod.map,
            ) || [];
          return [...options, ...newOptions];
        },
        [],
      );

    const preferencesOptions = (
      preference: ApplicationMultiselectQuestion,
      mapLayers: MapLayers[],
    ): ApplicationMultiselectQuestionOption[] => {
      const preferenceOptions = [];
      preference.options?.forEach((option) => {
        const addressData = option.extraData?.find(
          (data) => data.type === InputType.address,
        );
        if (option.checked && addressData) {
          const foundOption = mapPreferenceOptions.find(
            (preferenceOption) => preferenceOption.text === option.key,
          );
          if (foundOption && foundOption.mapLayerId) {
            const layer = mapLayers.find(
              (layer) => layer.id === foundOption.mapLayerId,
            );
            const geocodingVerified = this.verifyLayers(
              addressData.value as Address,
              layer?.featureCollection as unknown as FeatureCollection,
            );
            preferenceOptions.push({
              ...option,
              extraData: [
                ...option.extraData,
                {
                  key: 'geocodingVerified',
                  type: InputType.text,
                  value:
                    // If the geocoding value was not able to be verified we need to set it as "unknown"
                    // in order to signify we are unable to automatically verify and manually checking will need to be done
                    geocodingVerified === null ? 'unknown' : geocodingVerified,
                },
              ],
            });
            return;
          }
        }
        preferenceOptions.push(option);
      });
      return preferenceOptions;
    };
    if (mapPreferenceOptions?.length) {
      const newPreferences = [];
      const mapLayers = await this.prisma.mapLayers.findMany({
        where: {
          id: { in: mapPreferenceOptions.map((option) => option.mapLayerId) },
        },
      });
      preferences.forEach((preference) => {
        const newPreferenceOptions = preferencesOptions(preference, mapLayers);
        newPreferences.push({ ...preference, options: newPreferenceOptions });
      });
      return newPreferences;
    }
    return preferences;
  }
}
