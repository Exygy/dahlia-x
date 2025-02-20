import { RegionEnum } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
export type Neighborhood = {
  name: string
  region: RegionEnum
}

export const neighborhoodRegions: Neighborhood[] = [
  { name: "Airport Sub area", region: RegionEnum.Eastside },
  { name: "Barton McFarland area", region: RegionEnum.Westside },
  { name: "Boston-Edison / North End area", region: RegionEnum.Westside },
  { name: "Boynton", region: RegionEnum.Southwest },
  { name: "Campau / Banglatown", region: RegionEnum.Eastside },
  { name: "Dexter Linwood", region: RegionEnum.Westside },
  { name: "Farwell area", region: RegionEnum.Eastside },
  { name: "Gratiot Town / Kettering area", region: RegionEnum.Eastside },
  { name: "Gratiot / 7 Mile area", region: RegionEnum.Eastside },
  { name: "Greater Corktown area", region: RegionEnum.Greater_Downtown },
  { name: "Greater Downtown area", region: RegionEnum.Greater_Downtown },
  { name: "Islandview / Greater Villages area", region: RegionEnum.Eastside },
  { name: "Jefferson Chalmers area", region: RegionEnum.Eastside },
  { name: "Livernois / McNichols area", region: RegionEnum.Westside },
  { name: "Morningside area", region: RegionEnum.Eastside },
  { name: "North Campau area", region: RegionEnum.Eastside },
  { name: "Northwest Grand River area", region: RegionEnum.Westside },
  { name: "Northwest University District area", region: RegionEnum.Westside },
  { name: "Palmer Park area", region: RegionEnum.Westside },
  { name: "Russell Woods / Nardin Park area", region: RegionEnum.Westside },
  { name: "Southwest / Vernor area", region: RegionEnum.Southwest },
  { name: "Warrendale / Cody Rouge", region: RegionEnum.Westside },
  { name: "West End area", region: RegionEnum.Eastside },
]
