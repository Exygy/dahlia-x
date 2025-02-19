/** Generate by swagger-axios-codegen */
// @ts-nocheck
/* eslint-disable */

/** Generate by swagger-axios-codegen */
/* eslint-disable */
// @ts-nocheck
import axiosStatic, { AxiosInstance, AxiosRequestConfig } from "axios"

export interface IRequestOptions extends AxiosRequestConfig {
  /** only in axios interceptor config*/
  loading?: boolean
  showError?: boolean
}

export interface IRequestConfig {
  method?: any
  headers?: any
  url?: any
  data?: any
  params?: any
}

// Add options interface
export interface ServiceOptions {
  axios?: AxiosInstance
  /** only in axios interceptor config*/
  loading: boolean
  showError: boolean
}

// Add default options
export const serviceOptions: ServiceOptions = {}

// Instance selector
export function axios(
  configs: IRequestConfig,
  resolve: (p: any) => void,
  reject: (p: any) => void
): Promise<any> {
  if (serviceOptions.axios) {
    return serviceOptions.axios
      .request(configs)
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
        reject(err)
      })
  } else {
    throw new Error("please inject yourself instance like axios  ")
  }
}

export function getConfigs(
  method: string,
  contentType: string,
  url: string,
  options: any
): IRequestConfig {
  const configs: IRequestConfig = {
    loading: serviceOptions.loading,
    showError: serviceOptions.showError,
    ...options,
    method,
    url,
  }
  configs.headers = {
    ...options.headers,
    "Content-Type": contentType,
  }
  return configs
}

export const basePath = ""

export interface IList<T> extends Array<T> {}
export interface List<T> extends Array<T> {}
export interface IDictionary<TValue> {
  [key: string]: TValue
}
export interface Dictionary<TValue> extends IDictionary<TValue> {}

export interface IListResult<T> {
  items?: T[]
}

export class ListResult<T> implements IListResult<T> {
  items?: T[]
}

export interface IPagedResult<T> extends IListResult<T> {
  totalCount?: number
  items?: T[]
}

export class PagedResult<T = any> implements IPagedResult<T> {
  totalCount?: number
  items?: T[]
}

// customer definition
// empty

export class RootService {
  /**
   * Health check endpoint
   */
  healthCheck(options: IRequestOptions = {}): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Tip me over and pour me out
   */
  teapot(options: IRequestOptions = {}): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/teapot"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Trigger the removal of CSVs job
   */
  clearTempFiles(options: IRequestOptions = {}): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/clearTempFiles"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = null

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
}

export class ListingsService {
  /**
   * Get a paginated set of listings
   */
  list(
    params: {
      /**  */
      page?: number
      /**  */
      limit?: number | "all"
      /**  */
      filter?: ListingFilterParams[]
      /**  */
      view?: ListingViews
      /**  */
      orderBy?: ListingOrderByKeys
      /**  */
      orderDir?: OrderByEnum
      /**  */
      search?: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<PaginatedListing> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/listings"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)
      configs.params = {
        page: params["page"],
        limit: params["limit"],
        filter: params["filter"],
        view: params["view"],
        orderBy: params["orderBy"],
        orderDir: params["orderDir"],
        search: params["search"],
      }

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Create listing
   */
  create(
    params: {
      /** requestBody */
      body?: ListingCreate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<Listing> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/listings"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Delete listing by id
   */
  delete(
    params: {
      /** requestBody */
      body?: IdDTO
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/listings"

      const configs: IRequestConfig = getConfigs("delete", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get a paginated set of listings
   */
  filterableList(
    params: {
      /** requestBody */
      body?: ListingsQueryBody
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<PaginatedListing> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/listings/list"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get listings and units as zip
   */
  listAsCsv(
    params: {
      /**  */
      timeZone?: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/listings/csv"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)
      configs.params = { timeZone: params["timeZone"] }

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get listing map markers
   */
  mapMarkers(options: IRequestOptions = {}): Promise<ListingMapMarker[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/listings/mapMarkers"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get listing for external consumption by id
   */
  externalRetrieve(
    params: {
      /**  */
      id: string
      /**  */
      view?: ListingViews
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/listings/external/{id}"
      url = url.replace("{id}", params["id"] + "")

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)
      configs.params = { view: params["view"] }

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Duplicate listing
   */
  duplicate(
    params: {
      /** requestBody */
      body?: ListingDuplicate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<Listing> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/listings/duplicate"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Trigger the listing process job
   */
  process(options: IRequestOptions = {}): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/listings/closeListings"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = null

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Update listing by id
   */
  update(
    params: {
      /**  */
      id: string
      /** requestBody */
      body?: ListingUpdate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<Listing> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/listings/{id}"
      url = url.replace("{id}", params["id"] + "")

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get listing by id
   */
  retrieve(
    params: {
      /**  */
      id: string
      /**  */
      view?: ListingViews
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<Listing> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/listings/{id}"
      url = url.replace("{id}", params["id"] + "")

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)
      configs.params = { view: params["view"] }

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get listings by multiselect question id
   */
  retrieveListings(
    params: {
      /**  */
      multiselectQuestionId: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<IdDTO[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/listings/byMultiselectQuestion/{multiselectQuestionId}"
      url = url.replace("{multiselectQuestionId}", params["multiselectQuestionId"] + "")

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
}

export class ApplicationFlaggedSetsService {
  /**
   * List application flagged sets
   */
  list(
    params: {
      /**  */
      page?: number
      /**  */
      limit?: number | "all"
      /**  */
      listingId: string
      /**  */
      view?: AfsView
      /**  */
      search?: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<PaginatedAfs> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/applicationFlaggedSets"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)
      configs.params = {
        page: params["page"],
        limit: params["limit"],
        listingId: params["listingId"],
        view: params["view"],
        search: params["search"],
      }

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Meta information for application flagged sets
   */
  meta(
    params: {
      /**  */
      page?: number
      /**  */
      limit?: number | "all"
      /**  */
      listingId: string
      /**  */
      view?: AfsView
      /**  */
      search?: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<AfsMeta> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/applicationFlaggedSets/meta"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)
      configs.params = {
        page: params["page"],
        limit: params["limit"],
        listingId: params["listingId"],
        view: params["view"],
        search: params["search"],
      }

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Retrieve application flagged set by id
   */
  retrieve(
    params: {
      /**  */
      afsId: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<ApplicationFlaggedSet> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/applicationFlaggedSets/{afsId}"
      url = url.replace("{afsId}", params["afsId"] + "")

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Resolve application flagged set
   */
  resolve(
    params: {
      /** requestBody */
      body?: AfsResolve
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<ApplicationFlaggedSet> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/applicationFlaggedSets/resolve"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Trigger the duplicate check process
   */
  process(options: IRequestOptions = {}): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/applicationFlaggedSets/process"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = null

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Trigger the duplicate check process
   */
  processDuplicates(
    params: {
      /**  */
      listingId?: string
      /**  */
      force?: boolean
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/applicationFlaggedSets/process_duplicates"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)
      configs.params = { listingId: params["listingId"], force: params["force"] }

      let data = null

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Reset flagged set confirmation alert
   */
  resetConfirmationAlert(
    params: {
      /** requestBody */
      body?: IdDTO
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/applicationFlaggedSets/{id}"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
}

export class AmiChartsService {
  /**
   * List amiCharts
   */
  list(
    params: {
      /**  */
      jurisdictionId?: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<AmiChart[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/amiCharts"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)
      configs.params = { jurisdictionId: params["jurisdictionId"] }

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Create amiChart
   */
  create(
    params: {
      /** requestBody */
      body?: AmiChartCreate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<AmiChart> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/amiCharts"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Delete amiChart by id
   */
  delete(
    params: {
      /** requestBody */
      body?: IdDTO
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/amiCharts"

      const configs: IRequestConfig = getConfigs("delete", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get amiChart by id
   */
  retrieve(
    params: {
      /**  */
      amiChartId: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<AmiChart> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/amiCharts/{amiChartId}"
      url = url.replace("{amiChartId}", params["amiChartId"] + "")

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Update amiChart
   */
  update(
    params: {
      /** requestBody */
      body?: AmiChartUpdate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<AmiChart> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/amiCharts/{amiChartId}"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
}

export class ReservedCommunityTypesService {
  /**
   * List reservedCommunityTypes
   */
  list(
    params: {
      /**  */
      jurisdictionId?: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<ReservedCommunityType[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/reservedCommunityTypes"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)
      configs.params = { jurisdictionId: params["jurisdictionId"] }

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Create reservedCommunityType
   */
  create(
    params: {
      /** requestBody */
      body?: ReservedCommunityTypeCreate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<ReservedCommunityType> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/reservedCommunityTypes"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Delete reservedCommunityType by id
   */
  delete(
    params: {
      /** requestBody */
      body?: IdDTO
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/reservedCommunityTypes"

      const configs: IRequestConfig = getConfigs("delete", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get reservedCommunityType by id
   */
  retrieve(
    params: {
      /**  */
      reservedCommunityTypeId: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<ReservedCommunityType> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/reservedCommunityTypes/{reservedCommunityTypeId}"
      url = url.replace("{reservedCommunityTypeId}", params["reservedCommunityTypeId"] + "")

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Update reservedCommunityType
   */
  update(
    params: {
      /** requestBody */
      body?: ReservedCommunityTypeUpdate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<ReservedCommunityType> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/reservedCommunityTypes/{reservedCommunityTypeId}"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
}

export class UnitTypesService {
  /**
   * List unitTypes
   */
  list(options: IRequestOptions = {}): Promise<UnitType[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/unitTypes"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Create unitType
   */
  create(
    params: {
      /** requestBody */
      body?: UnitTypeCreate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<UnitType> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/unitTypes"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Delete unitType by id
   */
  delete(
    params: {
      /** requestBody */
      body?: IdDTO
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/unitTypes"

      const configs: IRequestConfig = getConfigs("delete", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get unitType by id
   */
  retrieve(
    params: {
      /**  */
      unitTypeId: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<UnitType> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/unitTypes/{unitTypeId}"
      url = url.replace("{unitTypeId}", params["unitTypeId"] + "")

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Update unitType
   */
  update(
    params: {
      /** requestBody */
      body?: UnitTypeUpdate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<UnitType> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/unitTypes/{unitTypeId}"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
}

export class UnitAccessibilityPriorityTypesService {
  /**
   * List unitAccessibilityPriorityTypes
   */
  list(options: IRequestOptions = {}): Promise<UnitAccessibilityPriorityType[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/unitAccessibilityPriorityTypes"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Create unitAccessibilityPriorityType
   */
  create(
    params: {
      /** requestBody */
      body?: UnitAccessibilityPriorityTypeCreate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<UnitAccessibilityPriorityType> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/unitAccessibilityPriorityTypes"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Delete unitAccessibilityPriorityType by id
   */
  delete(
    params: {
      /** requestBody */
      body?: IdDTO
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/unitAccessibilityPriorityTypes"

      const configs: IRequestConfig = getConfigs("delete", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get unitAccessibilityPriorityType by id
   */
  retrieve(
    params: {
      /**  */
      unitAccessibilityPriorityTypeId: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<UnitAccessibilityPriorityType> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/unitAccessibilityPriorityTypes/{unitAccessibilityPriorityTypeId}"
      url = url.replace(
        "{unitAccessibilityPriorityTypeId}",
        params["unitAccessibilityPriorityTypeId"] + ""
      )

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Update unitAccessibilityPriorityType
   */
  update(
    params: {
      /** requestBody */
      body?: UnitAccessibilityPriorityTypeUpdate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<UnitAccessibilityPriorityType> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/unitAccessibilityPriorityTypes/{unitAccessibilityPriorityTypeId}"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
}

export class UnitRentTypesService {
  /**
   * List unitRentTypes
   */
  list(options: IRequestOptions = {}): Promise<UnitRentType[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/unitRentTypes"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Create unitRentType
   */
  create(
    params: {
      /** requestBody */
      body?: UnitRentTypeCreate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<UnitRentType> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/unitRentTypes"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Delete unitRentType by id
   */
  delete(
    params: {
      /** requestBody */
      body?: IdDTO
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/unitRentTypes"

      const configs: IRequestConfig = getConfigs("delete", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get unitRentType by id
   */
  retrieve(
    params: {
      /**  */
      unitRentTypeId: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<UnitRentType> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/unitRentTypes/{unitRentTypeId}"
      url = url.replace("{unitRentTypeId}", params["unitRentTypeId"] + "")

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Update unitRentType
   */
  update(
    params: {
      /** requestBody */
      body?: UnitRentTypeUpdate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<UnitRentType> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/unitRentTypes/{unitRentTypeId}"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
}

export class JurisdictionsService {
  /**
   * List jurisdictions
   */
  list(options: IRequestOptions = {}): Promise<Jurisdiction[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/jurisdictions"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Create jurisdiction
   */
  create(
    params: {
      /** requestBody */
      body?: JurisdictionCreate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<Jurisdiction> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/jurisdictions"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Delete jurisdiction by id
   */
  delete(
    params: {
      /** requestBody */
      body?: IdDTO
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/jurisdictions"

      const configs: IRequestConfig = getConfigs("delete", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get jurisdiction by id
   */
  retrieve(
    params: {
      /**  */
      jurisdictionId: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<Jurisdiction> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/jurisdictions/{jurisdictionId}"
      url = url.replace("{jurisdictionId}", params["jurisdictionId"] + "")

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Update jurisdiction
   */
  update(
    params: {
      /** requestBody */
      body?: JurisdictionUpdate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<Jurisdiction> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/jurisdictions/{jurisdictionId}"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get jurisdiction by name
   */
  retrieveByName(
    params: {
      /**  */
      jurisdictionName: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<Jurisdiction> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/jurisdictions/byName/{jurisdictionName}"
      url = url.replace("{jurisdictionName}", params["jurisdictionName"] + "")

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
}

export class MultiselectQuestionsService {
  /**
   * List multiselect questions
   */
  list(
    params: {
      /**  */
      filter?: MultiselectQuestionFilterParams[]
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<MultiselectQuestion[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/multiselectQuestions"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)
      configs.params = { filter: params["filter"] }

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Create multiselect question
   */
  create(
    params: {
      /** requestBody */
      body?: MultiselectQuestionCreate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<MultiselectQuestion> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/multiselectQuestions"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Delete multiselect question by id
   */
  delete(
    params: {
      /** requestBody */
      body?: IdDTO
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/multiselectQuestions"

      const configs: IRequestConfig = getConfigs("delete", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get multiselect question by id
   */
  retrieve(
    params: {
      /**  */
      multiselectQuestionId: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<MultiselectQuestion> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/multiselectQuestions/{multiselectQuestionId}"
      url = url.replace("{multiselectQuestionId}", params["multiselectQuestionId"] + "")

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Update multiselect question
   */
  update(
    params: {
      /** requestBody */
      body?: MultiselectQuestionUpdate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<MultiselectQuestion> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/multiselectQuestions/{multiselectQuestionId}"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
}

export class ApplicationsService {
  /**
   * Get a paginated set of applications
   */
  list(
    params: {
      /**  */
      page?: number
      /**  */
      limit?: number | "all"
      /**  */
      listingId?: string
      /**  */
      search?: string
      /**  */
      userId?: string
      /**  */
      orderBy?: ApplicationOrderByKeys
      /**  */
      order?: OrderByEnum
      /**  */
      markedAsDuplicate?: boolean
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<PaginatedApplication> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/applications"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)
      configs.params = {
        page: params["page"],
        limit: params["limit"],
        listingId: params["listingId"],
        search: params["search"],
        userId: params["userId"],
        orderBy: params["orderBy"],
        order: params["order"],
        markedAsDuplicate: params["markedAsDuplicate"],
      }

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Create application (used by partners to hand create an application)
   */
  create(
    params: {
      /** requestBody */
      body?: ApplicationCreate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<Application> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/applications"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Delete application by id
   */
  delete(
    params: {
      /** requestBody */
      body?: IdDTO
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/applications"

      const configs: IRequestConfig = getConfigs("delete", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get the most recent application submitted by the user
   */
  mostRecentlyCreated(
    params: {
      /**  */
      userId: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<Application> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/applications/mostRecentlyCreated"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)
      configs.params = { userId: params["userId"] }

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get public applications info
   */
  publicAppsView(
    params: {
      /**  */
      userId: string
      /**  */
      filterType?: ApplicationsFilterEnum
      /**  */
      includeLotteryApps?: boolean
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<PublicAppsViewResponse> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/applications/publicAppsView"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)
      configs.params = {
        userId: params["userId"],
        filterType: params["filterType"],
        includeLotteryApps: params["includeLotteryApps"],
      }

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get applications as csv
   */
  listAsCsv(
    params: {
      /**  */
      id: string
      /**  */
      includeDemographics?: boolean
      /**  */
      timeZone?: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/applications/csv"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)
      configs.params = {
        id: params["id"],
        includeDemographics: params["includeDemographics"],
        timeZone: params["timeZone"],
      }

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get applications as spreadsheet
   */
  listAsSpreadsheet(
    params: {
      /**  */
      id: string
      /**  */
      includeDemographics?: boolean
      /**  */
      timeZone?: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/applications/spreadsheet"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)
      configs.params = {
        id: params["id"],
        includeDemographics: params["includeDemographics"],
        timeZone: params["timeZone"],
      }

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get application by id
   */
  retrieve(
    params: {
      /**  */
      applicationId: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<Application> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/applications/{applicationId}"
      url = url.replace("{applicationId}", params["applicationId"] + "")

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Submit application (used by applicants applying to a listing)
   */
  submit(
    params: {
      /** requestBody */
      body?: ApplicationCreate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<Application> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/applications/submit"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Verify application can be saved
   */
  submissionValidation(
    params: {
      /** requestBody */
      body?: ApplicationCreate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/applications/verify"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Update application by id
   */
  update(
    params: {
      /**  */
      id: string
      /** requestBody */
      body?: ApplicationUpdate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<Application> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/applications/{id}"
      url = url.replace("{id}", params["id"] + "")

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
}

export class AssetsService {
  /**
   * Create presigned upload metadata
   */
  createPresignedUploadMetadata(
    params: {
      /** requestBody */
      body?: CreatePresignedUploadMetadata
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<CreatePresignedUploadMetadataResponse> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/assets/presigned-upload-metadata"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
}

export class UserService {
  /**
   * Get a user from cookies
   */
  profile(options: IRequestOptions = {}): Promise<User> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/user"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Delete user by id
   */
  delete(
    params: {
      /** requestBody */
      body?: IdDTO
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/user"

      const configs: IRequestConfig = getConfigs("delete", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Creates a public only user
   */
  create(
    params: {
      /**  */
      noWelcomeEmail?: boolean
      /** requestBody */
      body?: UserCreate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<User> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/user"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)
      configs.params = { noWelcomeEmail: params["noWelcomeEmail"] }

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get a paginated set of users
   */
  list(
    params: {
      /**  */
      page?: number
      /**  */
      limit?: number | "all"
      /**  */
      filter?: UserFilterParams[]
      /**  */
      search?: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<PaginatedUser> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/user/list"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)
      configs.params = {
        page: params["page"],
        limit: params["limit"],
        filter: params["filter"],
        search: params["search"],
      }

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * List users in CSV
   */
  listAsCsv(options: IRequestOptions = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/user/csv"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get user by id
   */
  retrieve(
    params: {
      /**  */
      id: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<User> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/user/{id}"
      url = url.replace("{id}", params["id"] + "")

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Update user
   */
  update(
    params: {
      /** requestBody */
      body?: UserUpdate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<User> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/user/{id}"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Forgot Password
   */
  forgotPassword(
    params: {
      /** requestBody */
      body?: EmailAndAppUrl
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/user/forgot-password"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Invite partner user
   */
  invite(
    params: {
      /** requestBody */
      body?: UserInvite
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<User> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/user/invite"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Request single use code
   */
  requestSingleUseCode(
    params: {
      /** requestBody */
      body?: RequestSingleUseCode
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/user/request-single-use-code"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Resend public confirmation
   */
  resendConfirmation(
    params: {
      /** requestBody */
      body?: EmailAndAppUrl
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/user/resend-confirmation"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Resend partner confirmation
   */
  resendPartnerConfirmation(
    params: {
      /** requestBody */
      body?: EmailAndAppUrl
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/user/resend-partner-confirmation"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Verifies token is valid
   */
  isUserConfirmationTokenValid(
    params: {
      /** requestBody */
      body?: ConfirmationRequest
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/user/is-confirmation-token-valid"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
}

export class AuthService {
  /**
   * Login
   */
  login(
    params: {
      /** requestBody */
      body?: Login
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/auth/login"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * LoginViaSingleUseCode
   */
  loginViaASingleUseCode(
    params: {
      /** requestBody */
      body?: LoginViaSingleUseCode
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/auth/loginViaSingleUseCode"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Logout
   */
  logout(options: IRequestOptions = {}): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/auth/logout"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Request mfa code
   */
  requestMfaCode(
    params: {
      /** requestBody */
      body?: RequestMfaCode
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<RequestMfaCodeResponse> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/auth/request-mfa-code"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Requests a new token given a refresh token
   */
  requestNewToken(options: IRequestOptions = {}): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/auth/requestNewToken"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Update Password
   */
  updatePassword(
    params: {
      /** requestBody */
      body?: UpdatePassword
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/auth/update-password"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Confirm email
   */
  confirm(
    params: {
      /** requestBody */
      body?: Confirm
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/auth/confirm"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
}

export class MapLayersService {
  /**
   * List map layers
   */
  list(
    params: {
      /**  */
      jurisdictionId?: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<MapLayer[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/mapLayers"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)
      configs.params = { jurisdictionId: params["jurisdictionId"] }

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
}

export class ScriptRunnerService {
  /**
   * An example of how the script runner can work
   */
  exampleScript(options: IRequestOptions = {}): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/scriptRunner/exampleScript"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = null

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * A script that pulls data from one source into the current db
   */
  dataTransfer(
    params: {
      /** requestBody */
      body?: DataTransferDTO
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/scriptRunner/dataTransfer"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * A script that resends application confirmations to applicants of a listing
   */
  bulkApplicationResend(
    params: {
      /** requestBody */
      body?: BulkApplicationResendDTO
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/scriptRunner/bulkApplicationResend"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * A script that takes in a standardized string and outputs the input for the ami chart create endpoint
   */
  amiChartImport(
    params: {
      /** requestBody */
      body?: AmiChartImportDTO
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/scriptRunner/amiChartImport"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * A script that takes in a standardized string and outputs the input for the ami chart update endpoint
   */
  amiChartUpdateImport(
    params: {
      /** requestBody */
      body?: AmiChartUpdateImportDTO
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/scriptRunner/amiChartUpdateImport"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * A script that adds lottery translations to the db
   */
  lotteryTranslations(options: IRequestOptions = {}): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/scriptRunner/lotteryTranslations"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = null

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * A script that adds lottery translations to the db and creates them if it does not exist
   */
  lotteryTranslations1(options: IRequestOptions = {}): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/scriptRunner/lotteryTranslationsCreateIfEmpty"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = null

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * A script that opts out existing lottery listings
   */
  optOutExistingLotteries(options: IRequestOptions = {}): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/scriptRunner/optOutExistingLotteries"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = null

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * A script that creates a new reserved community type
   */
  createNewReservedCommunityType(
    params: {
      /** requestBody */
      body?: CommunityTypeDTO
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/scriptRunner/createNewReservedCommunityType"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * A script that updates single use code translations to show extended expiration time
   */
  updateCodeExpirationTranslations(options: IRequestOptions = {}): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/scriptRunner/updateCodeExpirationTranslations"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = null

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * A script that hides program multiselect questions from the public detail page
   */
  hideProgramsFromListings(options: IRequestOptions = {}): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/scriptRunner/hideProgramsFromListings"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = null

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * A script that updates the "what happens next" content in lottery email
   */
  updatesWhatHappensInLotteryEmail(options: IRequestOptions = {}): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/scriptRunner/updatesWhatHappensInLotteryEmail"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = null

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * A script that adds existing feature flags into the feature flag table
   */
  addFeatureFlags(options: IRequestOptions = {}): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/scriptRunner/addFeatureFlags"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = null

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
}

export class FeatureFlagsService {
  /**
   * List of feature flags
   */
  list(options: IRequestOptions = {}): Promise<FeatureFlag[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/featureFlags"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Create a feature flag
   */
  create(
    params: {
      /** requestBody */
      body?: FeatureFlagCreate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<FeatureFlag> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/featureFlags"

      const configs: IRequestConfig = getConfigs("post", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Update a feature flag
   */
  update(
    params: {
      /** requestBody */
      body?: FeatureFlagUpdate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<FeatureFlag> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/featureFlags"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Delete a feature flag by id
   */
  delete(
    params: {
      /** requestBody */
      body?: IdDTO
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/featureFlags"

      const configs: IRequestConfig = getConfigs("delete", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Associate and disassociate jurisdictions with a feature flag
   */
  associateJurisdictions(
    params: {
      /** requestBody */
      body?: FeatureFlagAssociate
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<FeatureFlag> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/featureFlags/associateJurisdictions"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get a feature flag by id
   */
  retrieve(
    params: {
      /**  */
      featureFlagId: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<FeatureFlag> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/featureFlags/{featureFlagId}"
      url = url.replace("{featureFlagId}", params["featureFlagId"] + "")

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
}

export class LotteryService {
  /**
   * Generate the lottery results for a listing
   */
  lotteryGenerate(
    params: {
      /** requestBody */
      body?: ApplicationCsvQueryParams
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/lottery/generateLotteryResults"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get applications lottery results
   */
  lotteryResults(
    params: {
      /**  */
      id: string
      /**  */
      includeDemographics?: boolean
      /**  */
      timeZone?: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/lottery/getLotteryResults"

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)
      configs.params = {
        id: params["id"],
        includeDemographics: params["includeDemographics"],
        timeZone: params["timeZone"],
      }

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Change the listing lottery status
   */
  lotteryStatus(
    params: {
      /** requestBody */
      body?: ListingLotteryStatus
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/lottery/lotteryStatus"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = params.body

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get a lottery activity log
   */
  lotteryActivityLog(
    params: {
      /**  */
      id: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<LotteryActivityLogItem[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/lottery/lotteryActivityLog/{id}"
      url = url.replace("{id}", params["id"] + "")

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Trigger the lottery auto publish process job
   */
  autoPublishResults(options: IRequestOptions = {}): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/lottery/autoPublishResults"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = null

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Trigger the lottery expiration process job
   */
  expireLotteries(options: IRequestOptions = {}): Promise<SuccessDTO> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/lottery/expireLotteries"

      const configs: IRequestConfig = getConfigs("put", "application/json", url, options)

      let data = null

      configs.data = data

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get lottery results by application id
   */
  publicLotteryResults(
    params: {
      /**  */
      id: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<PublicLotteryResult[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/lottery/publicLotteryResults/{id}"
      url = url.replace("{id}", params["id"] + "")

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
  /**
   * Get lottery totals by listing id
   */
  lotteryTotals(
    params: {
      /**  */
      id: string
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<PublicLotteryTotal[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + "/lottery/lotteryTotals/{id}"
      url = url.replace("{id}", params["id"] + "")

      const configs: IRequestConfig = getConfigs("get", "application/json", url, options)

      /** 适配ios13，get请求不允许带body */

      axios(configs, resolve, reject)
    })
  }
}

export interface SuccessDTO {
  /**  */
  success: boolean
}

export interface ListingFilterParams {
  /**  */
  $comparison: EnumListingFilterParamsComparison

  /**  */
  availability?: FilterAvailabilityEnum

  /**  */
  bathrooms?: number

  /**  */
  bedrooms?: number

  /**  */
  city?: string

  /**  */
  counties?: string[]

  /**  */
  homeTypes?: HomeTypeEnum[]

  /**  */
  ids?: string[]

  /**  */
  isVerified?: boolean

  /**  */
  jurisdiction?: string

  /**  */
  leasingAgent?: string

  /**  */
  listingFeatures?: string[]

  /**  */
  monthlyRent?: number

  /**  */
  name?: string

  /**  */
  neighborhood?: string

  /**  */
  regions?: RegionEnum[]

  /**  */
  reservedCommunityTypes?: string[]

  /**  */
  section8Acceptance?: boolean

  /**  */
  status?: ListingsStatusEnum

  /**  */
  zipCode?: string
}

export interface ListingsQueryBody {
  /**  */
  page?: number

  /**  */
  limit?: number | "all"

  /**  */
  filter?: ListingFilterParams[]

  /**  */
  view?: ListingViews

  /**  */
  orderBy?: ListingOrderByKeys

  /**  */
  orderDir?: OrderByEnum

  /**  */
  search?: string
}

export interface ListingsQueryParams {
  /**  */
  page?: number

  /**  */
  limit?: number | "all"

  /**  */
  filter?: string[]

  /**  */
  view?: ListingViews

  /**  */
  orderBy?: ListingOrderByKeys

  /**  */
  orderDir?: OrderByEnum

  /**  */
  search?: string
}

export interface ListingsRetrieveParams {
  /**  */
  view?: ListingViews
}

export interface PaginationAllowsAllQueryParams {
  /**  */
  page?: number

  /**  */
  limit?: number | "all"
}

export interface IdDTO {
  /**  */
  id: string

  /**  */
  name?: string

  /**  */
  ordinal?: number
}

export interface MultiselectLink {
  /**  */
  title: string

  /**  */
  url: string
}

export interface MultiselectOption {
  /**  */
  text: string

  /**  */
  untranslatedText?: string

  /**  */
  ordinal: number

  /**  */
  description?: string

  /**  */
  links?: MultiselectLink[]

  /**  */
  collectAddress?: boolean

  /**  */
  validationMethod?: ValidationMethodEnum

  /**  */
  radiusSize?: number

  /**  */
  collectName?: boolean

  /**  */
  collectRelationship?: boolean

  /**  */
  exclusive?: boolean

  /**  */
  mapLayerId?: string

  /**  */
  mapPinPosition?: string
}

export interface MultiselectQuestion {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  text: string

  /**  */
  untranslatedText?: string

  /**  */
  untranslatedOptOutText?: string

  /**  */
  subText?: string

  /**  */
  description?: string

  /**  */
  links?: MultiselectLink[]

  /**  */
  jurisdictions: IdDTO[]

  /**  */
  options?: MultiselectOption[]

  /**  */
  optOutText?: string

  /**  */
  hideFromListing?: boolean

  /**  */
  applicationSection: MultiselectQuestionsApplicationSectionEnum
}

export interface ListingMultiselectQuestion {
  /**  */
  multiselectQuestions: MultiselectQuestion

  /**  */
  ordinal?: number
}

export interface Asset {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  fileId: string

  /**  */
  label: string
}

export interface PaperApplication {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  language: LanguagesEnum

  /**  */
  assets: Asset
}

export interface ApplicationMethod {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  type: ApplicationMethodsTypeEnum

  /**  */
  label?: string

  /**  */
  externalReference?: string

  /**  */
  acceptsPostmarkedApplications?: boolean

  /**  */
  phoneNumber?: string

  /**  */
  paperApplications?: PaperApplication[]
}

export interface ListingEvent {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  type: ListingEventsTypeEnum

  /**  */
  startDate?: Date

  /**  */
  startTime?: Date

  /**  */
  endTime?: Date

  /**  */
  url?: string

  /**  */
  note?: string

  /**  */
  label?: string

  /**  */
  assets?: Asset
}

export interface Address {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  placeName?: string

  /**  */
  city: string

  /**  */
  county?: string

  /**  */
  state: string

  /**  */
  street: string

  /**  */
  street2?: string

  /**  */
  zipCode: string

  /**  */
  latitude?: number

  /**  */
  longitude?: number
}

export interface ListingImage {
  /**  */
  assets: Asset

  /**  */
  ordinal?: number
}

export interface ListingFeatures {
  /**  */
  elevator?: boolean

  /**  */
  wheelchairRamp?: boolean

  /**  */
  serviceAnimalsAllowed?: boolean

  /**  */
  accessibleParking?: boolean

  /**  */
  parkingOnSite?: boolean

  /**  */
  inUnitWasherDryer?: boolean

  /**  */
  laundryInBuilding?: boolean

  /**  */
  barrierFreeEntrance?: boolean

  /**  */
  rollInShower?: boolean

  /**  */
  grabBars?: boolean

  /**  */
  heatingInUnit?: boolean

  /**  */
  acInUnit?: boolean

  /**  */
  hearing?: boolean

  /**  */
  visual?: boolean

  /**  */
  mobility?: boolean
}

export interface ListingUtilities {
  /**  */
  water?: boolean

  /**  */
  gas?: boolean

  /**  */
  trash?: boolean

  /**  */
  sewer?: boolean

  /**  */
  electricity?: boolean

  /**  */
  cable?: boolean

  /**  */
  phone?: boolean

  /**  */
  internet?: boolean
}

export interface AmiChartItem {
  /**  */
  percentOfAmi: number

  /**  */
  householdSize: number

  /**  */
  income: number
}

export interface AmiChart {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  items: AmiChartItem[]

  /**  */
  name: string

  /**  */
  jurisdictions: IdDTO
}

export interface UnitType {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  name: UnitTypeEnum

  /**  */
  numBedrooms: number
}

export interface UnitRentType {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  name: UnitRentTypeEnum
}

export interface UnitAccessibilityPriorityType {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  name: string
}

export interface UnitAmiChartOverride {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  items: AmiChartItem[]
}

export interface Unit {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  amiChart?: AmiChart

  /**  */
  amiPercentage?: string

  /**  */
  annualIncomeMin?: string

  /**  */
  monthlyIncomeMin?: string

  /**  */
  floor?: number

  /**  */
  annualIncomeMax?: string

  /**  */
  maxOccupancy?: number

  /**  */
  minOccupancy?: number

  /**  */
  monthlyRent?: string

  /**  */
  numBathrooms?: number

  /**  */
  numBedrooms?: number

  /**  */
  number?: string

  /**  */
  sqFeet?: string

  /**  */
  monthlyRentAsPercentOfIncome?: string

  /**  */
  bmrProgramChart?: boolean

  /**  */
  unitTypes?: UnitType

  /**  */
  unitRentTypes?: UnitRentType

  /**  */
  unitAccessibilityPriorityTypes?: UnitAccessibilityPriorityType

  /**  */
  unitAmiChartOverrides?: UnitAmiChartOverride
}

export interface MinMaxCurrency {
  /**  */
  min: string

  /**  */
  max: string
}

export interface MinMax {
  /**  */
  min: number

  /**  */
  max: number
}

export interface UnitSummary {
  /**  */
  unitTypes: UnitType

  /**  */
  minIncomeRange: MinMaxCurrency

  /**  */
  occupancyRange: MinMax

  /**  */
  rentAsPercentIncomeRange: MinMax

  /**  */
  rentRange: MinMaxCurrency

  /**  */
  totalAvailable: number

  /**  */
  areaRange: MinMax

  /**  */
  floorRange?: MinMax
}

export interface UnitSummaryByAMI {
  /**  */
  percent: string

  /**  */
  byUnitType: UnitSummary[]
}

export interface HMI {
  /**  */
  columns: object

  /**  */
  rows: object[]
}

export interface UnitsSummarized {
  /**  */
  unitTypes: UnitType[]

  /**  */
  priorityTypes: UnitAccessibilityPriorityType[]

  /**  */
  amiPercentages: string[]

  /**  */
  byUnitTypeAndRent: UnitSummary[]

  /**  */
  byUnitType: UnitSummary[]

  /**  */
  byAMI: UnitSummaryByAMI[]

  /**  */
  hmi: HMI
}

export interface UnitsSummary {
  /**  */
  id: string

  /**  */
  unitTypes: IdDTO

  /**  */
  monthlyRentMin?: number

  /**  */
  monthlyRentMax?: number

  /**  */
  monthlyRentAsPercentOfIncome?: string

  /**  */
  amiPercentage?: number

  /**  */
  minimumIncomeMin?: string

  /**  */
  minimumIncomeMax?: string

  /**  */
  maxOccupancy?: number

  /**  */
  minOccupancy?: number

  /**  */
  floorMin?: number

  /**  */
  floorMax?: number

  /**  */
  sqFeetMin?: string

  /**  */
  sqFeetMax?: string

  /**  */
  unitAccessibilityPriorityTypes?: IdDTO

  /**  */
  totalCount?: number

  /**  */
  totalAvailable?: number
}

export interface ApplicationLotteryTotal {
  /**  */
  listingId: string

  /**  */
  multiselectQuestionId?: string

  /**  */
  total: number
}

export interface Listing {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  additionalApplicationSubmissionNotes?: string

  /**  */
  digitalApplication?: boolean

  /**  */
  commonDigitalApplication?: boolean

  /**  */
  paperApplication?: boolean

  /**  */
  referralOpportunity?: boolean

  /**  */
  accessibility?: string

  /**  */
  amenities?: string

  /**  */
  buildingTotalUnits?: number

  /**  */
  developer?: string

  /**  */
  householdSizeMax?: number

  /**  */
  householdSizeMin?: number

  /**  */
  neighborhood?: string

  /**  */
  petPolicy?: string

  /**  */
  smokingPolicy?: string

  /**  */
  unitsAvailable?: number

  /**  */
  unitAmenities?: string

  /**  */
  servicesOffered?: string

  /**  */
  yearBuilt?: number

  /**  */
  applicationDueDate?: Date

  /**  */
  applicationOpenDate?: Date

  /**  */
  applicationFee?: string

  /**  */
  applicationOrganization?: string

  /**  */
  applicationPickUpAddressOfficeHours?: string

  /**  */
  applicationPickUpAddressType?: ApplicationAddressTypeEnum

  /**  */
  applicationDropOffAddressOfficeHours?: string

  /**  */
  applicationDropOffAddressType?: ApplicationAddressTypeEnum

  /**  */
  applicationMailingAddressType?: ApplicationAddressTypeEnum

  /**  */
  buildingSelectionCriteria?: string

  /**  */
  costsNotIncluded?: string

  /**  */
  creditHistory?: string

  /**  */
  criminalBackground?: string

  /**  */
  depositMin?: string

  /**  */
  depositMax?: string

  /**  */
  depositHelperText?: string

  /**  */
  disableUnitsAccordion?: boolean

  /**  */
  leasingAgentEmail?: string

  /**  */
  leasingAgentName?: string

  /**  */
  leasingAgentOfficeHours?: string

  /**  */
  leasingAgentPhone?: string

  /**  */
  leasingAgentTitle?: string

  /**  */
  name: string

  /**  */
  postmarkedApplicationsReceivedByDate?: Date

  /**  */
  programRules?: string

  /**  */
  rentalAssistance?: string

  /**  */
  rentalHistory?: string

  /**  */
  requiredDocuments?: string

  /**  */
  specialNotes?: string

  /**  */
  waitlistCurrentSize?: number

  /**  */
  waitlistMaxSize?: number

  /**  */
  whatToExpect?: string

  /**  */
  status: ListingsStatusEnum

  /**  */
  reviewOrderType?: ReviewOrderTypeEnum

  /**  */
  applicationConfig?: object

  /**  */
  displayWaitlistSize: boolean

  /**  */
  showWaitlist?: boolean

  /**  */
  reservedCommunityDescription?: string

  /**  */
  reservedCommunityMinAge?: number

  /**  */
  resultLink?: string

  /**  */
  isWaitlistOpen?: boolean

  /**  */
  waitlistOpenSpots?: number

  /**  */
  customMapPin?: boolean

  /**  */
  contentUpdatedAt?: Date

  /**  */
  publishedAt?: Date

  /**  */
  closedAt?: Date

  /**  */
  afsLastRunAt?: Date

  /**  */
  lotteryLastPublishedAt?: Date

  /**  */
  lotteryLastRunAt?: Date

  /**  */
  lotteryStatus?: LotteryStatusEnum

  /**  */
  lastApplicationUpdateAt?: Date

  /**  */
  listingMultiselectQuestions?: ListingMultiselectQuestion[]

  /**  */
  applicationMethods: ApplicationMethod[]

  /**  */
  referralApplication?: ApplicationMethod

  /**  */
  assets: Asset[]

  /**  */
  listingEvents: ListingEvent[]

  /**  */
  listingsBuildingAddress: Address

  /**  */
  listingsApplicationPickUpAddress?: Address

  /**  */
  listingsApplicationDropOffAddress?: Address

  /**  */
  listingsApplicationMailingAddress?: Address

  /**  */
  listingsLeasingAgentAddress?: Address

  /**  */
  listingsBuildingSelectionCriteriaFile?: Asset

  /**  */
  jurisdictions: IdDTO

  /**  */
  listingsResult?: Asset

  /**  */
  reservedCommunityTypes?: IdDTO

  /**  */
  listingImages?: ListingImage[]

  /**  */
  listingFeatures?: ListingFeatures

  /**  */
  listingUtilities?: ListingUtilities

  /**  */
  units: Unit[]

  /**  */
  unitsSummarized?: UnitsSummarized

  /**  */
  unitsSummary?: UnitsSummary[]

  /**  */
  urlSlug?: string

  /**  */
  requestedChanges?: string

  /**  */
  requestedChangesDate?: Date

  /**  */
  requestedChangesUser?: IdDTO

  /**  */
  lotteryOptIn?: boolean

  /**  */
  applicationLotteryTotals: ApplicationLotteryTotal[]

  /**  */
  includeCommunityDisclaimer?: boolean

  /**  */
  communityDisclaimerTitle?: string

  /**  */
  communityDisclaimerDescription?: string

  /**  */
  marketingType?: MarketingTypeEnum

  /**  */
  marketingDate?: Date

  /**  */
  marketingSeason?: MarketingSeasonEnum

  /**  */
  homeType?: HomeTypeEnum
}

export interface PaginationMeta {
  /**  */
  currentPage: number

  /**  */
  itemCount: number

  /**  */
  itemsPerPage: number

  /**  */
  totalItems: number

  /**  */
  totalPages: number
}

export interface PaginatedListing {
  /**  */
  items: Listing[]

  /**  */
  meta: PaginationMeta
}

export interface ListingMapMarker {
  /**  */
  id: string

  /**  */
  lat: number

  /**  */
  lng: number
}

export interface UnitAmiChartOverrideCreate {
  /**  */
  items: AmiChartItem[]
}

export interface UnitCreate {
  /**  */
  amiPercentage?: string

  /**  */
  annualIncomeMin?: string

  /**  */
  monthlyIncomeMin?: string

  /**  */
  floor?: number

  /**  */
  annualIncomeMax?: string

  /**  */
  maxOccupancy?: number

  /**  */
  minOccupancy?: number

  /**  */
  monthlyRent?: string

  /**  */
  numBathrooms?: number

  /**  */
  numBedrooms?: number

  /**  */
  number?: string

  /**  */
  sqFeet?: string

  /**  */
  monthlyRentAsPercentOfIncome?: string

  /**  */
  bmrProgramChart?: boolean

  /**  */
  unitTypes?: IdDTO

  /**  */
  amiChart?: IdDTO

  /**  */
  unitAccessibilityPriorityTypes?: IdDTO

  /**  */
  unitRentTypes?: IdDTO

  /**  */
  unitAmiChartOverrides?: UnitAmiChartOverrideCreate
}

export interface AssetCreate {
  /**  */
  fileId: string

  /**  */
  label: string

  /**  */
  id?: string
}

export interface PaperApplicationCreate {
  /**  */
  language: LanguagesEnum

  /**  */
  assets?: AssetCreate
}

export interface ApplicationMethodCreate {
  /**  */
  type: ApplicationMethodsTypeEnum

  /**  */
  label?: string

  /**  */
  externalReference?: string

  /**  */
  acceptsPostmarkedApplications?: boolean

  /**  */
  phoneNumber?: string

  /**  */
  paperApplications?: PaperApplicationCreate[]
}

export interface UnitsSummaryCreate {
  /**  */
  unitTypes: IdDTO

  /**  */
  monthlyRentMin?: number

  /**  */
  monthlyRentMax?: number

  /**  */
  monthlyRentAsPercentOfIncome?: string

  /**  */
  amiPercentage?: number

  /**  */
  minimumIncomeMin?: string

  /**  */
  minimumIncomeMax?: string

  /**  */
  maxOccupancy?: number

  /**  */
  minOccupancy?: number

  /**  */
  floorMin?: number

  /**  */
  floorMax?: number

  /**  */
  sqFeetMin?: string

  /**  */
  sqFeetMax?: string

  /**  */
  unitAccessibilityPriorityTypes?: IdDTO

  /**  */
  totalCount?: number

  /**  */
  totalAvailable?: number
}

export interface ListingImageCreate {
  /**  */
  ordinal?: number

  /**  */
  assets: AssetCreate
}

export interface AddressCreate {
  /**  */
  placeName?: string

  /**  */
  city: string

  /**  */
  county?: string

  /**  */
  state: string

  /**  */
  street: string

  /**  */
  street2?: string

  /**  */
  zipCode: string

  /**  */
  latitude?: number

  /**  */
  longitude?: number
}

export interface ListingEventCreate {
  /**  */
  type: ListingEventsTypeEnum

  /**  */
  startDate?: Date

  /**  */
  startTime?: Date

  /**  */
  endTime?: Date

  /**  */
  url?: string

  /**  */
  note?: string

  /**  */
  label?: string

  /**  */
  assets?: AssetCreate
}

export interface ListingCreate {
  /**  */
  additionalApplicationSubmissionNotes?: string

  /**  */
  digitalApplication?: boolean

  /**  */
  commonDigitalApplication?: boolean

  /**  */
  paperApplication?: boolean

  /**  */
  referralOpportunity?: boolean

  /**  */
  accessibility?: string

  /**  */
  amenities?: string

  /**  */
  buildingTotalUnits?: number

  /**  */
  developer?: string

  /**  */
  householdSizeMax?: number

  /**  */
  householdSizeMin?: number

  /**  */
  neighborhood?: string

  /**  */
  petPolicy?: string

  /**  */
  smokingPolicy?: string

  /**  */
  unitsAvailable?: number

  /**  */
  unitAmenities?: string

  /**  */
  servicesOffered?: string

  /**  */
  yearBuilt?: number

  /**  */
  applicationDueDate?: Date

  /**  */
  applicationOpenDate?: Date

  /**  */
  applicationFee?: string

  /**  */
  applicationOrganization?: string

  /**  */
  applicationPickUpAddressOfficeHours?: string

  /**  */
  applicationPickUpAddressType?: ApplicationAddressTypeEnum

  /**  */
  applicationDropOffAddressOfficeHours?: string

  /**  */
  applicationDropOffAddressType?: ApplicationAddressTypeEnum

  /**  */
  applicationMailingAddressType?: ApplicationAddressTypeEnum

  /**  */
  buildingSelectionCriteria?: string

  /**  */
  costsNotIncluded?: string

  /**  */
  creditHistory?: string

  /**  */
  criminalBackground?: string

  /**  */
  depositMin?: string

  /**  */
  depositMax?: string

  /**  */
  depositHelperText?: string

  /**  */
  disableUnitsAccordion?: boolean

  /**  */
  leasingAgentEmail?: string

  /**  */
  leasingAgentName?: string

  /**  */
  leasingAgentOfficeHours?: string

  /**  */
  leasingAgentPhone?: string

  /**  */
  leasingAgentTitle?: string

  /**  */
  name: string

  /**  */
  postmarkedApplicationsReceivedByDate?: Date

  /**  */
  programRules?: string

  /**  */
  rentalAssistance?: string

  /**  */
  rentalHistory?: string

  /**  */
  requiredDocuments?: string

  /**  */
  specialNotes?: string

  /**  */
  waitlistCurrentSize?: number

  /**  */
  waitlistMaxSize?: number

  /**  */
  whatToExpect?: string

  /**  */
  status: ListingsStatusEnum

  /**  */
  reviewOrderType?: ReviewOrderTypeEnum

  /**  */
  displayWaitlistSize: boolean

  /**  */
  reservedCommunityDescription?: string

  /**  */
  reservedCommunityMinAge?: number

  /**  */
  resultLink?: string

  /**  */
  isWaitlistOpen?: boolean

  /**  */
  waitlistOpenSpots?: number

  /**  */
  customMapPin?: boolean

  /**  */
  contentUpdatedAt?: Date

  /**  */
  lotteryLastPublishedAt?: Date

  /**  */
  lotteryLastRunAt?: Date

  /**  */
  lotteryStatus?: LotteryStatusEnum

  /**  */
  lastApplicationUpdateAt?: Date

  /**  */
  jurisdictions: IdDTO

  /**  */
  reservedCommunityTypes?: IdDTO

  /**  */
  requestedChanges?: string

  /**  */
  requestedChangesDate?: Date

  /**  */
  lotteryOptIn?: boolean

  /**  */
  includeCommunityDisclaimer?: boolean

  /**  */
  communityDisclaimerTitle?: string

  /**  */
  communityDisclaimerDescription?: string

  /**  */
  marketingType?: MarketingTypeEnum

  /**  */
  marketingDate?: Date

  /**  */
  marketingSeason?: MarketingSeasonEnum

  /**  */
  homeType?: HomeTypeEnum

  /**  */
  listingMultiselectQuestions?: IdDTO[]

  /**  */
  units?: UnitCreate[]

  /**  */
  applicationMethods?: ApplicationMethodCreate[]

  /**  */
  assets?: AssetCreate[]

  /**  */
  unitsSummary: UnitsSummaryCreate[]

  /**  */
  listingImages?: ListingImageCreate[]

  /**  */
  listingsApplicationPickUpAddress?: AddressCreate

  /**  */
  listingsApplicationMailingAddress?: AddressCreate

  /**  */
  listingsApplicationDropOffAddress?: AddressCreate

  /**  */
  listingsLeasingAgentAddress?: AddressCreate

  /**  */
  listingsBuildingAddress?: AddressCreate

  /**  */
  listingsBuildingSelectionCriteriaFile?: AssetCreate

  /**  */
  listingsResult?: AssetCreate

  /**  */
  listingEvents: ListingEventCreate[]

  /**  */
  listingFeatures?: ListingFeatures

  /**  */
  listingUtilities?: ListingUtilities

  /**  */
  requestedChangesUser?: IdDTO
}

export interface ListingDuplicate {
  /**  */
  name: string

  /**  */
  includeUnits: boolean

  /**  */
  storedListing: IdDTO
}

export interface ListingUpdate {
  /**  */
  id: string

  /**  */
  additionalApplicationSubmissionNotes?: string

  /**  */
  digitalApplication?: boolean

  /**  */
  commonDigitalApplication?: boolean

  /**  */
  paperApplication?: boolean

  /**  */
  referralOpportunity?: boolean

  /**  */
  accessibility?: string

  /**  */
  amenities?: string

  /**  */
  buildingTotalUnits?: number

  /**  */
  developer?: string

  /**  */
  householdSizeMax?: number

  /**  */
  householdSizeMin?: number

  /**  */
  neighborhood?: string

  /**  */
  petPolicy?: string

  /**  */
  smokingPolicy?: string

  /**  */
  unitsAvailable?: number

  /**  */
  unitAmenities?: string

  /**  */
  servicesOffered?: string

  /**  */
  yearBuilt?: number

  /**  */
  applicationDueDate?: Date

  /**  */
  applicationOpenDate?: Date

  /**  */
  applicationFee?: string

  /**  */
  applicationOrganization?: string

  /**  */
  applicationPickUpAddressOfficeHours?: string

  /**  */
  applicationPickUpAddressType?: ApplicationAddressTypeEnum

  /**  */
  applicationDropOffAddressOfficeHours?: string

  /**  */
  applicationDropOffAddressType?: ApplicationAddressTypeEnum

  /**  */
  applicationMailingAddressType?: ApplicationAddressTypeEnum

  /**  */
  buildingSelectionCriteria?: string

  /**  */
  costsNotIncluded?: string

  /**  */
  creditHistory?: string

  /**  */
  criminalBackground?: string

  /**  */
  depositMin?: string

  /**  */
  depositMax?: string

  /**  */
  depositHelperText?: string

  /**  */
  disableUnitsAccordion?: boolean

  /**  */
  leasingAgentEmail?: string

  /**  */
  leasingAgentName?: string

  /**  */
  leasingAgentOfficeHours?: string

  /**  */
  leasingAgentPhone?: string

  /**  */
  leasingAgentTitle?: string

  /**  */
  name: string

  /**  */
  postmarkedApplicationsReceivedByDate?: Date

  /**  */
  programRules?: string

  /**  */
  rentalAssistance?: string

  /**  */
  rentalHistory?: string

  /**  */
  requiredDocuments?: string

  /**  */
  specialNotes?: string

  /**  */
  waitlistCurrentSize?: number

  /**  */
  waitlistMaxSize?: number

  /**  */
  whatToExpect?: string

  /**  */
  status: ListingsStatusEnum

  /**  */
  reviewOrderType?: ReviewOrderTypeEnum

  /**  */
  displayWaitlistSize: boolean

  /**  */
  reservedCommunityDescription?: string

  /**  */
  reservedCommunityMinAge?: number

  /**  */
  resultLink?: string

  /**  */
  isWaitlistOpen?: boolean

  /**  */
  waitlistOpenSpots?: number

  /**  */
  customMapPin?: boolean

  /**  */
  contentUpdatedAt?: Date

  /**  */
  lotteryLastPublishedAt?: Date

  /**  */
  lotteryLastRunAt?: Date

  /**  */
  lotteryStatus?: LotteryStatusEnum

  /**  */
  lastApplicationUpdateAt?: Date

  /**  */
  jurisdictions: IdDTO

  /**  */
  reservedCommunityTypes?: IdDTO

  /**  */
  requestedChanges?: string

  /**  */
  requestedChangesDate?: Date

  /**  */
  lotteryOptIn?: boolean

  /**  */
  includeCommunityDisclaimer?: boolean

  /**  */
  communityDisclaimerTitle?: string

  /**  */
  communityDisclaimerDescription?: string

  /**  */
  marketingType?: MarketingTypeEnum

  /**  */
  marketingDate?: Date

  /**  */
  marketingSeason?: MarketingSeasonEnum

  /**  */
  homeType?: HomeTypeEnum

  /**  */
  listingMultiselectQuestions?: IdDTO[]

  /**  */
  units?: UnitCreate[]

  /**  */
  applicationMethods?: ApplicationMethodCreate[]

  /**  */
  assets?: AssetCreate[]

  /**  */
  unitsSummary: UnitsSummaryCreate[]

  /**  */
  listingImages?: ListingImageCreate[]

  /**  */
  listingsApplicationPickUpAddress?: AddressCreate

  /**  */
  listingsApplicationMailingAddress?: AddressCreate

  /**  */
  listingsApplicationDropOffAddress?: AddressCreate

  /**  */
  listingsLeasingAgentAddress?: AddressCreate

  /**  */
  listingsBuildingAddress?: AddressCreate

  /**  */
  listingsBuildingSelectionCriteriaFile?: AssetCreate

  /**  */
  listingsResult?: AssetCreate

  /**  */
  listingEvents: ListingEventCreate[]

  /**  */
  listingFeatures?: ListingFeatures

  /**  */
  listingUtilities?: ListingUtilities

  /**  */
  requestedChangesUser?: IdDTO
}

export interface Accessibility {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  mobility?: boolean

  /**  */
  vision?: boolean

  /**  */
  hearing?: boolean
}

export interface Demographic {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  ethnicity?: string

  /**  */
  gender?: string

  /**  */
  sexualOrientation?: string

  /**  */
  howDidYouHear: string[]

  /**  */
  race: string[]
}

export interface Applicant {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  firstName?: string

  /**  */
  middleName?: string

  /**  */
  lastName?: string

  /**  */
  birthMonth?: string

  /**  */
  birthDay?: string

  /**  */
  birthYear?: string

  /**  */
  emailAddress?: string

  /**  */
  noEmail?: boolean

  /**  */
  phoneNumber?: string

  /**  */
  phoneNumberType?: string

  /**  */
  noPhone?: boolean

  /**  */
  workInRegion?: YesNoEnum

  /**  */
  applicantWorkAddress: Address

  /**  */
  applicantAddress: Address
}

export interface AlternateContact {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  type?: AlternateContactRelationship

  /**  */
  otherType?: string

  /**  */
  firstName?: string

  /**  */
  lastName?: string

  /**  */
  agency?: string

  /**  */
  phoneNumber?: string

  /**  */
  emailAddress?: string

  /**  */
  address: Address
}

export interface HouseholdMember {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  orderId?: number

  /**  */
  firstName?: string

  /**  */
  middleName?: string

  /**  */
  lastName?: string

  /**  */
  birthMonth?: string

  /**  */
  birthDay?: string

  /**  */
  birthYear?: string

  /**  */
  sameAddress?: YesNoEnum

  /**  */
  relationship?: HouseholdMemberRelationship

  /**  */
  workInRegion?: YesNoEnum

  /**  */
  householdMemberWorkAddress?: Address

  /**  */
  householdMemberAddress: Address
}

export interface ApplicationMultiselectQuestionOption {
  /**  */
  key: string

  /**  */
  checked: boolean

  /**  */
  mapPinPosition?: string

  /**  */
  extraData?: AllExtraDataTypes[]
}

export interface ApplicationMultiselectQuestion {
  /**  */
  multiselectQuestionId: string

  /**  */
  key: string

  /**  */
  claimed: boolean

  /**  */
  options: ApplicationMultiselectQuestionOption[]
}

export interface ApplicationLotteryPosition {
  /**  */
  listingId: string

  /**  */
  applicationId: string

  /**  */
  multiselectQuestionId: string

  /**  */
  ordinal: number
}

export interface Application {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  deletedAt?: Date

  /**  */
  appUrl?: string

  /**  */
  additionalPhone?: boolean

  /**  */
  additionalPhoneNumber?: string

  /**  */
  additionalPhoneNumberType?: string

  /**  */
  contactPreferences: string[]

  /**  */
  householdSize: number

  /**  */
  housingStatus?: string

  /**  */
  sendMailToMailingAddress?: boolean

  /**  */
  householdExpectingChanges?: boolean

  /**  */
  householdStudent?: boolean

  /**  */
  incomeVouchers?: boolean

  /**  */
  income?: string

  /**  */
  incomePeriod?: IncomePeriodEnum

  /**  */
  status: ApplicationStatusEnum

  /**  */
  language?: LanguagesEnum

  /**  */
  acceptedTerms?: boolean

  /**  */
  submissionType: ApplicationSubmissionTypeEnum

  /**  */
  submissionDate?: Date

  /**  */
  markedAsDuplicate: boolean

  /**  */
  flagged?: boolean

  /**  */
  confirmationCode: string

  /**  */
  reviewStatus?: ApplicationReviewStatusEnum

  /**  */
  applicationsMailingAddress: Address

  /**  */
  applicationsAlternateAddress: Address

  /**  */
  accessibility: Accessibility

  /**  */
  demographics: Demographic

  /**  */
  preferredUnitTypes: UnitType[]

  /**  */
  applicant: Applicant

  /**  */
  alternateContact: AlternateContact

  /**  */
  householdMember: HouseholdMember[]

  /**  */
  preferences?: ApplicationMultiselectQuestion[]

  /**  */
  programs?: ApplicationMultiselectQuestion[]

  /**  */
  listings: IdDTO

  /**  */
  applicationLotteryPositions: ApplicationLotteryPosition[]
}

export interface ApplicationFlaggedSet {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  resolvingUser: IdDTO

  /**  */
  listing: IdDTO

  /**  */
  rule: RuleEnum

  /**  */
  ruleKey: string

  /**  */
  resolvedTime?: Date

  /**  */
  listingId: string

  /**  */
  showConfirmationAlert: boolean

  /**  */
  status: FlaggedSetStatusEnum

  /**  */
  applications: Application[]
}

export interface ApplicationFlaggedSetPaginationMeta {
  /**  */
  currentPage: number

  /**  */
  itemCount: number

  /**  */
  itemsPerPage: number

  /**  */
  totalItems: number

  /**  */
  totalPages: number

  /**  */
  totalFlagged: number
}

export interface PaginatedAfs {
  /**  */
  items: ApplicationFlaggedSet[]

  /**  */
  meta: ApplicationFlaggedSetPaginationMeta
}

export interface AfsMeta {
  /**  */
  totalCount?: number

  /**  */
  totalResolvedCount?: number

  /**  */
  totalPendingCount?: number

  /**  */
  totalNamePendingCount?: number

  /**  */
  totalEmailPendingCount?: number
}

export interface AfsResolve {
  /**  */
  afsId: string

  /**  */
  status: FlaggedSetStatusEnum

  /**  */
  applications: IdDTO[]
}

export interface AmiChartQueryParams {
  /**  */
  jurisdictionId?: string
}

export interface AmiChartCreate {
  /**  */
  items: AmiChartItem[]

  /**  */
  name: string

  /**  */
  jurisdictions: IdDTO
}

export interface AmiChartUpdate {
  /**  */
  id: string

  /**  */
  items: AmiChartItem[]

  /**  */
  name: string
}

export interface ReservedCommunityTypeQueryParams {
  /**  */
  jurisdictionId?: string
}

export interface ReservedCommunityType {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  name: string

  /**  */
  description?: string

  /**  */
  jurisdictions: IdDTO
}

export interface ReservedCommunityTypeCreate {
  /**  */
  name: string

  /**  */
  description?: string

  /**  */
  jurisdictions: IdDTO
}

export interface ReservedCommunityTypeUpdate {
  /**  */
  id: string

  /**  */
  name: string

  /**  */
  description?: string
}

export interface UnitTypeCreate {
  /**  */
  name: UnitTypeEnum

  /**  */
  numBedrooms: number
}

export interface UnitTypeUpdate {
  /**  */
  id: string

  /**  */
  name: UnitTypeEnum

  /**  */
  numBedrooms: number
}

export interface UnitAccessibilityPriorityTypeCreate {
  /**  */
  name: string
}

export interface UnitAccessibilityPriorityTypeUpdate {
  /**  */
  id: string

  /**  */
  name: string
}

export interface UnitRentTypeCreate {
  /**  */
  name: UnitRentTypeEnum
}

export interface UnitRentTypeUpdate {
  /**  */
  id: string

  /**  */
  name: UnitRentTypeEnum
}

export interface JurisdictionCreate {
  /**  */
  name: string

  /**  */
  notificationsSignUpUrl?: string

  /**  */
  languages: LanguagesEnum[]

  /**  */
  partnerTerms?: string

  /**  */
  publicUrl: string

  /**  */
  emailFromAddress: string

  /**  */
  rentalAssistanceDefault: string

  /**  */
  enablePartnerSettings?: boolean

  /**  */
  enablePartnerDemographics?: boolean

  /**  */
  enableGeocodingPreferences?: boolean

  /**  */
  enableGeocodingRadiusMethod?: boolean

  /**  */
  allowSingleUseCodeLogin: boolean

  /**  */
  listingApprovalPermissions: UserRoleEnum[]

  /**  */
  duplicateListingPermissions: UserRoleEnum[]
}

export interface JurisdictionUpdate {
  /**  */
  id: string

  /**  */
  name: string

  /**  */
  notificationsSignUpUrl?: string

  /**  */
  languages: LanguagesEnum[]

  /**  */
  partnerTerms?: string

  /**  */
  publicUrl: string

  /**  */
  emailFromAddress: string

  /**  */
  rentalAssistanceDefault: string

  /**  */
  enablePartnerSettings?: boolean

  /**  */
  enablePartnerDemographics?: boolean

  /**  */
  enableGeocodingPreferences?: boolean

  /**  */
  enableGeocodingRadiusMethod?: boolean

  /**  */
  allowSingleUseCodeLogin: boolean

  /**  */
  listingApprovalPermissions: UserRoleEnum[]

  /**  */
  duplicateListingPermissions: UserRoleEnum[]
}

export interface FeatureFlag {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  name: FeatureFlagEnum

  /**  */
  description: string

  /**  */
  active: boolean

  /**  */
  jurisdictions: IdDTO[]
}

export interface Jurisdiction {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  name: string

  /**  */
  notificationsSignUpUrl?: string

  /**  */
  languages: LanguagesEnum[]

  /**  */
  multiselectQuestions: IdDTO[]

  /**  */
  partnerTerms?: string

  /**  */
  publicUrl: string

  /**  */
  emailFromAddress: string

  /**  */
  rentalAssistanceDefault: string

  /**  */
  enablePartnerSettings?: boolean

  /**  */
  enablePartnerDemographics?: boolean

  /**  */
  enableGeocodingPreferences?: boolean

  /**  */
  enableGeocodingRadiusMethod?: boolean

  /**  */
  allowSingleUseCodeLogin: boolean

  /**  */
  listingApprovalPermissions: UserRoleEnum[]

  /**  */
  duplicateListingPermissions: UserRoleEnum[]

  /**  */
  featureFlags: FeatureFlag[]
}

export interface MultiselectQuestionCreate {
  /**  */
  text: string

  /**  */
  untranslatedOptOutText?: string

  /**  */
  subText?: string

  /**  */
  description?: string

  /**  */
  links?: MultiselectLink[]

  /**  */
  jurisdictions: IdDTO[]

  /**  */
  options?: MultiselectOption[]

  /**  */
  optOutText?: string

  /**  */
  hideFromListing?: boolean

  /**  */
  applicationSection: MultiselectQuestionsApplicationSectionEnum
}

export interface MultiselectQuestionUpdate {
  /**  */
  id: string

  /**  */
  text: string

  /**  */
  untranslatedOptOutText?: string

  /**  */
  subText?: string

  /**  */
  description?: string

  /**  */
  links?: MultiselectLink[]

  /**  */
  jurisdictions: IdDTO[]

  /**  */
  options?: MultiselectOption[]

  /**  */
  optOutText?: string

  /**  */
  hideFromListing?: boolean

  /**  */
  applicationSection: MultiselectQuestionsApplicationSectionEnum
}

export interface MultiselectQuestionQueryParams {
  /**  */
  filter?: string[]
}

export interface MultiselectQuestionFilterParams {
  /**  */
  $comparison: EnumMultiselectQuestionFilterParamsComparison

  /**  */
  jurisdiction?: string

  /**  */
  applicationSection?: MultiselectQuestionsApplicationSectionEnum
}

export interface AddressInput {
  /**  */
  type: InputType

  /**  */
  key: string

  /**  */
  value: AddressCreate
}

export interface BooleanInput {
  /**  */
  type: InputType

  /**  */
  key: string

  /**  */
  value: boolean
}

export interface TextInput {
  /**  */
  type: InputType

  /**  */
  key: string

  /**  */
  value: string
}

export interface PaginatedApplication {
  /**  */
  items: Application[]

  /**  */
  meta: PaginationMeta
}

export interface PublicAppsFiltered {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  deletedAt?: Date

  /**  */
  appUrl?: string

  /**  */
  additionalPhone?: boolean

  /**  */
  additionalPhoneNumber?: string

  /**  */
  additionalPhoneNumberType?: string

  /**  */
  contactPreferences: string[]

  /**  */
  householdSize: number

  /**  */
  housingStatus?: string

  /**  */
  sendMailToMailingAddress?: boolean

  /**  */
  householdExpectingChanges?: boolean

  /**  */
  householdStudent?: boolean

  /**  */
  incomeVouchers?: boolean

  /**  */
  income?: string

  /**  */
  incomePeriod?: IncomePeriodEnum

  /**  */
  status: ApplicationStatusEnum

  /**  */
  language?: LanguagesEnum

  /**  */
  acceptedTerms?: boolean

  /**  */
  submissionType: ApplicationSubmissionTypeEnum

  /**  */
  submissionDate?: Date

  /**  */
  markedAsDuplicate: boolean

  /**  */
  flagged?: boolean

  /**  */
  confirmationCode: string

  /**  */
  reviewStatus?: ApplicationReviewStatusEnum

  /**  */
  applicationsMailingAddress: Address

  /**  */
  applicationsAlternateAddress: Address

  /**  */
  accessibility: Accessibility

  /**  */
  demographics: Demographic

  /**  */
  preferredUnitTypes: UnitType[]

  /**  */
  applicant: Applicant

  /**  */
  alternateContact: AlternateContact

  /**  */
  householdMember: HouseholdMember[]

  /**  */
  preferences?: ApplicationMultiselectQuestion[]

  /**  */
  programs?: ApplicationMultiselectQuestion[]

  /**  */
  applicationLotteryPositions: ApplicationLotteryPosition[]

  /**  */
  listings: Listing
}

export interface PublicAppsCount {
  /**  */
  total: number

  /**  */
  lottery: number

  /**  */
  closed: number

  /**  */
  open: number
}

export interface PublicAppsViewResponse {
  /**  */
  displayApplications: PublicAppsFiltered[]

  /**  */
  applicationsCount: PublicAppsCount
}

export interface ApplicantUpdate {
  /**  */
  firstName?: string

  /**  */
  middleName?: string

  /**  */
  lastName?: string

  /**  */
  birthMonth?: string

  /**  */
  birthDay?: string

  /**  */
  birthYear?: string

  /**  */
  emailAddress?: string

  /**  */
  noEmail?: boolean

  /**  */
  phoneNumber?: string

  /**  */
  phoneNumberType?: string

  /**  */
  noPhone?: boolean

  /**  */
  workInRegion?: YesNoEnum

  /**  */
  applicantAddress: AddressCreate

  /**  */
  applicantWorkAddress: AddressCreate
}

export interface AlternateContactUpdate {
  /**  */
  type?: AlternateContactRelationship

  /**  */
  otherType?: string

  /**  */
  firstName?: string

  /**  */
  lastName?: string

  /**  */
  agency?: string

  /**  */
  phoneNumber?: string

  /**  */
  emailAddress?: string

  /**  */
  address: AddressCreate
}

export interface AccessibilityUpdate {
  /**  */
  mobility?: boolean

  /**  */
  vision?: boolean

  /**  */
  hearing?: boolean
}

export interface DemographicUpdate {
  /**  */
  ethnicity?: string

  /**  */
  gender?: string

  /**  */
  sexualOrientation?: string

  /**  */
  howDidYouHear: string[]

  /**  */
  race: string[]
}

export interface HouseholdMemberUpdate {
  /**  */
  orderId?: number

  /**  */
  firstName?: string

  /**  */
  middleName?: string

  /**  */
  lastName?: string

  /**  */
  birthMonth?: string

  /**  */
  birthDay?: string

  /**  */
  birthYear?: string

  /**  */
  sameAddress?: YesNoEnum

  /**  */
  relationship?: HouseholdMemberRelationship

  /**  */
  workInRegion?: YesNoEnum

  /**  */
  id?: string

  /**  */
  householdMemberAddress: AddressCreate

  /**  */
  householdMemberWorkAddress?: AddressCreate
}

export interface ApplicationCreate {
  /**  */
  appUrl?: string

  /**  */
  additionalPhone?: boolean

  /**  */
  additionalPhoneNumber?: string

  /**  */
  additionalPhoneNumberType?: string

  /**  */
  contactPreferences: string[]

  /**  */
  householdSize: number

  /**  */
  housingStatus?: string

  /**  */
  sendMailToMailingAddress?: boolean

  /**  */
  householdExpectingChanges?: boolean

  /**  */
  householdStudent?: boolean

  /**  */
  incomeVouchers?: boolean

  /**  */
  income?: string

  /**  */
  incomePeriod?: IncomePeriodEnum

  /**  */
  status: ApplicationStatusEnum

  /**  */
  language?: LanguagesEnum

  /**  */
  acceptedTerms?: boolean

  /**  */
  submissionType: ApplicationSubmissionTypeEnum

  /**  */
  submissionDate?: Date

  /**  */
  reviewStatus?: ApplicationReviewStatusEnum

  /**  */
  preferences?: ApplicationMultiselectQuestion[]

  /**  */
  programs?: ApplicationMultiselectQuestion[]

  /**  */
  listings: IdDTO

  /**  */
  applicant: ApplicantUpdate

  /**  */
  applicationsMailingAddress: AddressCreate

  /**  */
  applicationsAlternateAddress: AddressCreate

  /**  */
  alternateContact: AlternateContactUpdate

  /**  */
  accessibility: AccessibilityUpdate

  /**  */
  demographics: DemographicUpdate

  /**  */
  householdMember: HouseholdMemberUpdate[]

  /**  */
  preferredUnitTypes: IdDTO[]
}

export interface ApplicationUpdate {
  /**  */
  id: string

  /**  */
  appUrl?: string

  /**  */
  additionalPhone?: boolean

  /**  */
  additionalPhoneNumber?: string

  /**  */
  additionalPhoneNumberType?: string

  /**  */
  contactPreferences: string[]

  /**  */
  householdSize: number

  /**  */
  housingStatus?: string

  /**  */
  sendMailToMailingAddress?: boolean

  /**  */
  householdExpectingChanges?: boolean

  /**  */
  householdStudent?: boolean

  /**  */
  incomeVouchers?: boolean

  /**  */
  income?: string

  /**  */
  incomePeriod?: IncomePeriodEnum

  /**  */
  status: ApplicationStatusEnum

  /**  */
  language?: LanguagesEnum

  /**  */
  acceptedTerms?: boolean

  /**  */
  submissionType: ApplicationSubmissionTypeEnum

  /**  */
  submissionDate?: Date

  /**  */
  reviewStatus?: ApplicationReviewStatusEnum

  /**  */
  preferences?: ApplicationMultiselectQuestion[]

  /**  */
  programs?: ApplicationMultiselectQuestion[]

  /**  */
  listings: IdDTO

  /**  */
  applicant: ApplicantUpdate

  /**  */
  applicationsMailingAddress: AddressCreate

  /**  */
  applicationsAlternateAddress: AddressCreate

  /**  */
  alternateContact: AlternateContactUpdate

  /**  */
  accessibility: AccessibilityUpdate

  /**  */
  demographics: DemographicUpdate

  /**  */
  householdMember: HouseholdMemberUpdate[]

  /**  */
  preferredUnitTypes: IdDTO[]
}

export interface CreatePresignedUploadMetadata {
  /**  */
  parametersToSign: object
}

export interface CreatePresignedUploadMetadataResponse {
  /**  */
  signature: string
}

export interface EmailAndAppUrl {
  /**  */
  email: string

  /**  */
  appUrl?: string
}

export interface UserRole {
  /**  */
  isAdmin?: boolean

  /**  */
  isJurisdictionalAdmin?: boolean

  /**  */
  isPartner?: boolean
}

export interface User {
  /**  */
  id: string

  /**  */
  createdAt: Date

  /**  */
  updatedAt: Date

  /**  */
  passwordUpdatedAt: Date

  /**  */
  passwordValidForDays: number

  /**  */
  confirmedAt?: Date

  /**  */
  email: string

  /**  */
  firstName: string

  /**  */
  middleName?: string

  /**  */
  lastName: string

  /**  */
  dob?: Date

  /**  */
  phoneNumber?: string

  /**  */
  listings: IdDTO[]

  /**  */
  userRoles?: UserRole

  /**  */
  language?: LanguagesEnum

  /**  */
  jurisdictions: Jurisdiction[]

  /**  */
  mfaEnabled?: boolean

  /**  */
  lastLoginAt?: Date

  /**  */
  failedLoginAttemptsCount?: number

  /**  */
  phoneNumberVerified?: boolean

  /**  */
  agreedToTermsOfService: boolean

  /**  */
  hitConfirmationURL?: Date

  /**  */
  activeAccessToken?: string

  /**  */
  activeRefreshToken?: string
}

export interface UserFilterParams {
  /**  */
  isPortalUser?: boolean
}

export interface PaginatedUser {
  /**  */
  items: User[]

  /**  */
  meta: PaginationMeta
}

export interface UserUpdate {
  /**  */
  id: string

  /**  */
  firstName: string

  /**  */
  middleName?: string

  /**  */
  lastName: string

  /**  */
  dob?: Date

  /**  */
  phoneNumber?: string

  /**  */
  listings: IdDTO[]

  /**  */
  userRoles?: UserRole

  /**  */
  language?: LanguagesEnum

  /**  */
  agreedToTermsOfService: boolean

  /**  */
  email?: string

  /**  */
  newEmail?: string

  /**  */
  password?: string

  /**  */
  currentPassword?: string

  /**  */
  appUrl?: string

  /**  */
  jurisdictions?: IdDTO[]
}

export interface UserCreate {
  /**  */
  firstName: string

  /**  */
  middleName?: string

  /**  */
  lastName: string

  /**  */
  dob?: Date

  /**  */
  phoneNumber?: string

  /**  */
  listings: IdDTO[]

  /**  */
  language?: LanguagesEnum

  /**  */
  agreedToTermsOfService: boolean

  /**  */
  newEmail?: string

  /**  */
  appUrl?: string

  /**  */
  password: string

  /**  */
  passwordConfirmation: string

  /**  */
  email: string

  /**  */
  emailConfirmation?: string

  /**  */
  jurisdictions?: IdDTO[]
}

export interface UserInvite {
  /**  */
  firstName: string

  /**  */
  middleName?: string

  /**  */
  lastName: string

  /**  */
  dob?: Date

  /**  */
  phoneNumber?: string

  /**  */
  listings: IdDTO[]

  /**  */
  userRoles?: UserRole

  /**  */
  language?: LanguagesEnum

  /**  */
  newEmail?: string

  /**  */
  appUrl?: string

  /**  */
  email: string

  /**  */
  jurisdictions: IdDTO[]
}

export interface RequestSingleUseCode {
  /**  */
  email: string
}

export interface ConfirmationRequest {
  /**  */
  token: string
}

export interface Login {
  /**  */
  email: string

  /**  */
  password: string

  /**  */
  mfaCode?: string

  /**  */
  mfaType?: MfaType

  /**  */
  reCaptchaToken?: string
}

export interface LoginViaSingleUseCode {
  /**  */
  email: string

  /**  */
  singleUseCode: string
}

export interface RequestMfaCode {
  /**  */
  email: string

  /**  */
  password: string

  /**  */
  mfaType: MfaType

  /**  */
  phoneNumber?: string
}

export interface RequestMfaCodeResponse {
  /**  */
  phoneNumber?: string

  /**  */
  email?: string

  /**  */
  phoneNumberVerified?: boolean
}

export interface UpdatePassword {
  /**  */
  password: string

  /**  */
  passwordConfirmation: string

  /**  */
  token: string
}

export interface Confirm {
  /**  */
  token: string

  /**  */
  password?: string
}

export interface MapLayer {
  /**  */
  id: string

  /**  */
  name: string

  /**  */
  jurisdictionId: string
}

export interface DataTransferDTO {
  /**  */
  connectionString: string
}

export interface BulkApplicationResendDTO {
  /**  */
  listingId: string
}

export interface AmiChartImportDTO {
  /**  */
  values: string

  /**  */
  name: string

  /**  */
  jurisdictionId: string
}

export interface AmiChartUpdateImportDTO {
  /**  */
  values: string

  /**  */
  amiId: string
}

export interface CommunityTypeDTO {
  /**  */
  id: string

  /**  */
  name: string

  /**  */
  description?: string
}

export interface FeatureFlagAssociate {
  /**  */
  id: string

  /**  */
  associate: string[]

  /**  */
  remove: string[]
}

export interface FeatureFlagCreate {
  /**  */
  name: FeatureFlagEnum

  /**  */
  description: string

  /**  */
  active: boolean
}

export interface FeatureFlagUpdate {
  /**  */
  id: string

  /**  */
  description: string

  /**  */
  active: boolean
}

export interface ApplicationCsvQueryParams {
  /**  */
  id: string

  /**  */
  includeDemographics?: boolean

  /**  */
  timeZone?: string
}

export interface ListingLotteryStatus {
  /**  */
  id: string

  /**  */
  lotteryStatus: LotteryStatusEnum
}

export interface LotteryActivityLogItem {
  /**  */
  status: string

  /**  */
  name: string

  /**  */
  logDate: Date
}

export interface PublicLotteryResult {
  /**  */
  ordinal: number

  /**  */
  multiselectQuestionId?: string
}

export interface PublicLotteryTotal {
  /**  */
  total: number

  /**  */
  multiselectQuestionId?: string
}

export enum FilterAvailabilityEnum {
  "waitlistOpen" = "waitlistOpen",
  "unitsAvailable" = "unitsAvailable",
}

export enum HomeTypeEnum {
  "apartment" = "apartment",
  "duplex" = "duplex",
  "house" = "house",
  "townhome" = "townhome",
}

export enum RegionEnum {
  "Greater_Downtown" = "Greater_Downtown",
  "Eastside" = "Eastside",
  "Southwest" = "Southwest",
  "Westside" = "Westside",
}

export enum ListingsStatusEnum {
  "active" = "active",
  "pending" = "pending",
  "closed" = "closed",
  "pendingReview" = "pendingReview",
  "changesRequested" = "changesRequested",
}
export enum EnumListingFilterParamsComparison {
  "=" = "=",
  "<>" = "<>",
  "IN" = "IN",
  ">=" = ">=",
  "<=" = "<=",
  "LIKE" = "LIKE",
  "NA" = "NA",
}
export enum ListingViews {
  "fundamentals" = "fundamentals",
  "base" = "base",
  "full" = "full",
  "details" = "details",
  "csv" = "csv",
}

export enum ListingOrderByKeys {
  "mostRecentlyUpdated" = "mostRecentlyUpdated",
  "applicationDates" = "applicationDates",
  "mostRecentlyClosed" = "mostRecentlyClosed",
  "mostRecentlyPublished" = "mostRecentlyPublished",
  "name" = "name",
  "waitlistOpen" = "waitlistOpen",
  "status" = "status",
  "unitsAvailable" = "unitsAvailable",
  "marketingType" = "marketingType",
}

export enum OrderByEnum {
  "asc" = "asc",
  "desc" = "desc",
}

export enum ApplicationAddressTypeEnum {
  "leasingAgent" = "leasingAgent",
}

export enum ReviewOrderTypeEnum {
  "lottery" = "lottery",
  "firstComeFirstServe" = "firstComeFirstServe",
  "waitlist" = "waitlist",
}

export enum LotteryStatusEnum {
  "errored" = "errored",
  "ran" = "ran",
  "approved" = "approved",
  "releasedToPartners" = "releasedToPartners",
  "publishedToPublic" = "publishedToPublic",
  "expired" = "expired",
}

export enum ValidationMethodEnum {
  "radius" = "radius",
  "map" = "map",
  "none" = "none",
}

export enum MultiselectQuestionsApplicationSectionEnum {
  "programs" = "programs",
  "preferences" = "preferences",
}

export enum ApplicationMethodsTypeEnum {
  "Internal" = "Internal",
  "FileDownload" = "FileDownload",
  "ExternalLink" = "ExternalLink",
  "PaperPickup" = "PaperPickup",
  "POBox" = "POBox",
  "LeasingAgent" = "LeasingAgent",
  "Referral" = "Referral",
}

export enum LanguagesEnum {
  "en" = "en",
  "es" = "es",
  "vi" = "vi",
  "zh" = "zh",
  "tl" = "tl",
  "bn" = "bn",
  "ar" = "ar",
}

export enum ListingEventsTypeEnum {
  "openHouse" = "openHouse",
  "publicLottery" = "publicLottery",
  "lotteryResults" = "lotteryResults",
}

export enum UnitTypeEnum {
  "studio" = "studio",
  "oneBdrm" = "oneBdrm",
  "twoBdrm" = "twoBdrm",
  "threeBdrm" = "threeBdrm",
  "fourBdrm" = "fourBdrm",
  "SRO" = "SRO",
  "fiveBdrm" = "fiveBdrm",
}

export enum UnitRentTypeEnum {
  "fixed" = "fixed",
  "percentageOfIncome" = "percentageOfIncome",
}

export enum MarketingTypeEnum {
  "marketing" = "marketing",
  "comingSoon" = "comingSoon",
}

export enum MarketingSeasonEnum {
  "spring" = "spring",
  "summer" = "summer",
  "fall" = "fall",
  "winter" = "winter",
}

export enum AfsView {
  "pending" = "pending",
  "pendingNameAndDoB" = "pendingNameAndDoB",
  "pendingEmail" = "pendingEmail",
  "resolved" = "resolved",
}

export enum RuleEnum {
  "nameAndDOB" = "nameAndDOB",
  "email" = "email",
  "combination" = "combination",
}

export enum FlaggedSetStatusEnum {
  "flagged" = "flagged",
  "pending" = "pending",
  "resolved" = "resolved",
}

export enum IncomePeriodEnum {
  "perMonth" = "perMonth",
  "perYear" = "perYear",
}

export enum ApplicationStatusEnum {
  "draft" = "draft",
  "submitted" = "submitted",
  "removed" = "removed",
}

export enum ApplicationSubmissionTypeEnum {
  "paper" = "paper",
  "electronical" = "electronical",
}

export enum ApplicationReviewStatusEnum {
  "pending" = "pending",
  "pendingAndValid" = "pendingAndValid",
  "valid" = "valid",
  "duplicate" = "duplicate",
}

export enum YesNoEnum {
  "yes" = "yes",
  "no" = "no",
}

export enum AlternateContactRelationship {
  "familyMember" = "familyMember",
  "friend" = "friend",
  "caseManager" = "caseManager",
  "other" = "other",
  "noContact" = "noContact",
}

export enum HouseholdMemberRelationship {
  "spouse" = "spouse",
  "registeredDomesticPartner" = "registeredDomesticPartner",
  "parent" = "parent",
  "child" = "child",
  "sibling" = "sibling",
  "cousin" = "cousin",
  "aunt" = "aunt",
  "uncle" = "uncle",
  "nephew" = "nephew",
  "niece" = "niece",
  "grandparent" = "grandparent",
  "greatGrandparent" = "greatGrandparent",
  "inLaw" = "inLaw",
  "friend" = "friend",
  "other" = "other",
}
export type AllExtraDataTypes = BooleanInput | TextInput | AddressInput
export enum UserRoleEnum {
  "user" = "user",
  "partner" = "partner",
  "admin" = "admin",
  "jurisdictionAdmin" = "jurisdictionAdmin",
}

export enum FeatureFlagEnum {
  "example" = "example",
  "enableHomeType" = "enableHomeType",
  "enableAccessibilityFeatures" = "enableAccessibilityFeatures",
  "enableUtilitiesIncluded" = "enableUtilitiesIncluded",
  "hideCloseListingButton" = "hideCloseListingButton",
  "enableMarketingStatus" = "enableMarketingStatus",
}
export enum EnumMultiselectQuestionFilterParamsComparison {
  "=" = "=",
  "<>" = "<>",
  "IN" = "IN",
  ">=" = ">=",
  "<=" = "<=",
  "LIKE" = "LIKE",
  "NA" = "NA",
}
export enum InputType {
  "boolean" = "boolean",
  "text" = "text",
  "address" = "address",
  "hhMemberSelect" = "hhMemberSelect",
}

export enum ApplicationOrderByKeys {
  "firstName" = "firstName",
  "lastName" = "lastName",
  "submissionDate" = "submissionDate",
  "createdAt" = "createdAt",
}

export enum ApplicationsFilterEnum {
  "all" = "all",
  "lottery" = "lottery",
  "closed" = "closed",
  "open" = "open",
}

export enum MfaType {
  "sms" = "sms",
  "email" = "email",
}
