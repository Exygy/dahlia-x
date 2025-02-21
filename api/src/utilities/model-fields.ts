import { Prisma } from '@prisma/client';

export const getModelFields = (modelName: string) => {
  return Prisma.dmmf.datamodel.models.filter(
    (model) => model.name === modelName,
  )[0].fields;
};

export const fillModelStringFields = (
  modelName: string,
  data: Record<string, string | null>,
) => {
  return Object.fromEntries(
    getModelFields(modelName)
      .filter((field) => field.isId === false && field.type === 'String')
      .map((field) => [field.name, data[field.name] || null]),
  );
};
