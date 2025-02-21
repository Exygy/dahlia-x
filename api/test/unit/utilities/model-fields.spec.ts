import {
  fillModelStringFields,
  getModelFields,
} from '../../../src/utilities/model-fields';
describe('Testing access to model fields', () => {
  describe('Testing getModelFields', () => {
    it('should return schema information on model fields', () => {
      expect(getModelFields('ListingNeighborhoodAmenities')[0]).toMatchObject({
        // there are more properties than this, we'll just test a few:
        kind: 'scalar',
        name: 'id',
        type: 'String',
      });
    });
  });
  describe('Testing fillModelStringFields', () => {
    it("should fill all the fields which weren't filled out with null", () => {
      expect(
        fillModelStringFields('ListingNeighborhoodAmenities', {
          schools: 'Schools',
        }),
      ).toMatchObject({
        // there are more properties than this, we'll just test a few:
        schools: 'Schools',
        healthCareResources: null,
        groceryStores: null,
      });
    });
  });
});
