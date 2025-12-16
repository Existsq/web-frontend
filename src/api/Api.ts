/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ErrorResponse {
  /** @format date-time */
  timestamp?: string;
  status?: string;
  error?: string;
  message?: string;
  path?: string;
}

export interface UserCredentialsDTO {
  username?: string;
  password?: string;
}

export interface UserDTO {
  /** @format int64 */
  id?: number;
  username?: string;
  moderator?: boolean;
}

export interface CategoryDTO {
  /** @format int64 */
  id?: number;
  title?: string;
  /** @format double */
  basePrice?: number;
  /** @format uuid */
  imageUUID?: string;
  description?: string;
  shortDescription?: string;
  /** @format double */
  coefficient?: number;
  /** @format double */
  userSpent?: number;
  status?: "ACTIVE" | "DELETED";
}

export interface CalculateCpiDTO {
  /** @format int64 */
  id?: number;
  status?: "DRAFT" | "DELETED" | "FORMED" | "COMPLETED" | "REJECTED";
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  formedAt?: string;
  /** @format date-time */
  completedAt?: string;
  /** @format date */
  comparisonDate?: string;
  creatorUsername?: string;
  moderatorUsername?: string;
  /** @format double */
  personalCPI?: number;
  calculationSuccess?: boolean;
  categories?: CategoryDTO[];
  /** @format int32 */
  filledCategoriesCount?: number;
}

export interface CalculateCpiCategoryDTO {
  calculateCpi?: CalculateCpiDTO;
  category?: CategoryDTO;
  /** @format double */
  userSpent?: number;
  /** @format double */
  coefficient?: number;
}

export interface JwtToken {
  value?: string;
}

export interface DraftInfoDTO {
  /** @format int64 */
  draftId?: number;
  /** @format int32 */
  countCategories?: number;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "http://localhost:8080",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
      withCredentials: true, // Явно устанавливаем для каждого запроса
    });
  };
}

/**
 * @title OpenAPI definition
 * @version v0
 * @baseUrl http://localhost:8080
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Возвращает информацию о текущем аутентифицированном пользователе
     *
     * @tags Users
     * @name GetCurrentUser
     * @summary Получить текущего пользователя
     * @request GET:/api/users/me
     */
    getCurrentUser: (params: RequestParams = {}) =>
      this.request<UserDTO, ErrorResponse>({
        path: `/api/users/me`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Позволяет пользователю обновить свои данные или модератору изменить данные
     *
     * @tags Users
     * @name UpdateUser
     * @summary Обновить текущего пользователя
     * @request PUT:/api/users/me
     */
    updateUser: (data: UserCredentialsDTO, params: RequestParams = {}) =>
      this.request<UserDTO, ErrorResponse>({
        path: `/api/users/me`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Возвращает информацию о категории по её идентификатору.
     *
     * @tags Categories
     * @name FindById
     * @summary Получить категорию по ID
     * @request GET:/api/categories/{categoryId}
     */
    findById: (categoryId: number, params: RequestParams = {}) =>
      this.request<CategoryDTO, ErrorResponse>({
        path: `/api/categories/${categoryId}`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Обновляет существующую категорию. Доступно только модератору.
     *
     * @tags Categories
     * @name Update
     * @summary Обновить категорию
     * @request PUT:/api/categories/{categoryId}
     * @secure
     */
    update: (
      categoryId: number,
      data: CategoryDTO,
      params: RequestParams = {},
    ) =>
      this.request<CategoryDTO, ErrorResponse | CategoryDTO>({
        path: `/api/categories/${categoryId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Удаляет категорию по ID. Доступно только модератору.
     *
     * @tags Categories
     * @name Delete
     * @summary Удалить категорию
     * @request DELETE:/api/categories/{categoryId}
     * @secure
     */
    delete: (categoryId: number, params: RequestParams = {}) =>
      this.request<void, ErrorResponse | void>({
        path: `/api/categories/${categoryId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Возвращает расчет CPI по его идентификатору, если у пользователя есть к нему доступ.
     *
     * @tags CPI Calculation
     * @name GetById
     * @summary Получить расчет CPI по ID
     * @request GET:/api/calculate-cpi/{id}
     * @secure
     */
    getById: (id: number, params: RequestParams = {}) =>
      this.request<CalculateCpiDTO, ErrorResponse>({
        path: `/api/calculate-cpi/${id}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Позволяет пользователю обновить черновик расчета CPI. Доступно только владельцу.
     *
     * @tags CPI Calculation
     * @name Update1
     * @summary Обновить расчет CPI
     * @request PUT:/api/calculate-cpi/{id}
     * @secure
     */
    update1: (id: number, data: CalculateCpiDTO, params: RequestParams = {}) =>
      this.request<CalculateCpiDTO, ErrorResponse | CalculateCpiDTO>({
        path: `/api/calculate-cpi/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Переводит черновик в статус 'сформирован'. Доступно только его владельцу.
     *
     * @tags CPI Calculation
     * @name FormDraft
     * @summary Сформировать черновик расчета
     * @request PUT:/api/calculate-cpi/form/{draftId}
     * @secure
     */
    formDraft: (draftId: number, params: RequestParams = {}) =>
      this.request<CalculateCpiDTO, ErrorResponse | CalculateCpiDTO>({
        path: `/api/calculate-cpi/form/${draftId}`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * @description Позволяет модератору завершить или отклонить расчет CPI.
     *
     * @tags CPI Calculation
     * @name DenyOrComplete
     * @summary Одобрить или отклонить расчет CPI
     * @request PUT:/api/calculate-cpi/deny-complete/{id}
     * @secure
     */
    denyOrComplete: (
      id: number,
      query: {
        /** Флаг, указывающий одобрить (true) или отклонить (false) расчет */
        approve: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<CalculateCpiDTO, ErrorResponse | CalculateCpiDTO>({
        path: `/api/calculate-cpi/deny-complete/${id}`,
        method: "PUT",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Позволяет обновить значения (например, сумму расходов) по определенной категории в расчете CPI.
     *
     * @tags CPI Categories
     * @name Update2
     * @summary Обновить категорию в расчете CPI
     * @request PUT:/api/calculate-cpi-categories/{cpiId}/category/{categoryId}
     * @secure
     */
    update2: (
      cpiId: number,
      categoryId: number,
      data: CalculateCpiCategoryDTO,
      params: RequestParams = {},
    ) =>
      this.request<
        CalculateCpiCategoryDTO,
        ErrorResponse | CalculateCpiCategoryDTO
      >({
        path: `/api/calculate-cpi-categories/${cpiId}/category/${categoryId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Удаляет категорию из указанного расчета CPI, если пользователь имеет права на изменение черновика.
     *
     * @tags CPI Categories
     * @name Delete1
     * @summary Удалить категорию из расчета CPI
     * @request DELETE:/api/calculate-cpi-categories/{cpiId}/category/{categoryId}
     * @secure
     */
    delete1: (cpiId: number, categoryId: number, params: RequestParams = {}) =>
      this.request<void, ErrorResponse | void>({
        path: `/api/calculate-cpi-categories/${cpiId}/category/${categoryId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Регистрирует пользователя и возвращает JWT токен в httpOnly cookie
     *
     * @tags Users
     * @name Register
     * @summary Регистрация нового пользователя
     * @request POST:/api/users/register
     */
    register: (data: UserCredentialsDTO, params: RequestParams = {}) =>
      this.request<JwtToken, ErrorResponse>({
        path: `/api/users/register`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Удаляет JWT токен из cookie, завершает сессию пользователя
     *
     * @tags Users
     * @name Logout
     * @summary Выход пользователя
     * @request POST:/api/users/logout
     */
    logout: (params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/api/users/logout`,
        method: "POST",
        ...params,
      }),

    /**
     * @description Устанавливает JWT токен в cookie, если данные для входа валидны
     *
     * @tags Users
     * @name Login
     * @summary Вход пользователя
     * @request POST:/api/users/login
     */
    login: (data: UserCredentialsDTO, params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/api/users/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Возвращает список всех категорий. Можно фильтровать по названию.
     *
     * @tags Categories
     * @name FindAll
     * @summary Получить все категории
     * @request GET:/api/categories
     */
    findAll: (
      query?: {
        /**
         * Фильтр по названию категории
         * @example "Еда"
         */
        title?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<CategoryDTO[], ErrorResponse>({
        path: `/api/categories`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description Создает новую категорию. Доступно только модератору.
     *
     * @tags Categories
     * @name Create
     * @summary Создать новую категорию
     * @request POST:/api/categories
     * @secure
     */
    create: (data: CategoryDTO, params: RequestParams = {}) =>
      this.request<CategoryDTO, ErrorResponse | CategoryDTO>({
        path: `/api/categories`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Прикрепляет изображение к категории. Доступно только модератору.
     *
     * @tags Categories
     * @name AddImage
     * @summary Добавить изображение к категории
     * @request POST:/api/categories/{categoryId}/image
     * @secure
     */
    addImage: (
      categoryId: number,
      data: {
        /**
         * Файл изображения
         * @format binary
         */
        file: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<CategoryDTO, ErrorResponse | CategoryDTO>({
        path: `/api/categories/${categoryId}/image`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * @description Добавляет выбранную категорию в черновик пользователя.
     *
     * @tags Categories
     * @name AddCategoryToDraft
     * @summary Добавить категорию в черновик CPI
     * @request POST:/api/categories/{categoryId}/draft
     * @secure
     */
    addCategoryToDraft: (categoryId: number, params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/api/categories/${categoryId}/draft`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Возвращает список расчетов, отфильтрованных по дате и статусу. Доступно только аутентифицированным пользователям.
     *
     * @tags CPI Calculation
     * @name GetAll
     * @summary Получить список расчетов CPI
     * @request GET:/api/calculate-cpi
     * @secure
     */
    getAll: (
      query?: {
        /**
         * Дата начала периода фильтрации (по дате создания)
         * @format date
         * @example "2025-01-01"
         */
        from?: string;
        /**
         * Дата конца периода фильтрации (по дате создания)
         * @format date
         * @example "2025-02-01"
         */
        to?: string;
        /**
         * Дата начала периода фильтрации (по дате формирования)
         * @format date
         * @example "2025-01-01"
         */
        formedFrom?: string;
        /**
         * Дата конца периода фильтрации (по дате формирования)
         * @format date
         * @example "2025-02-01"
         */
        formedTo?: string;
        /** Статус расчета (например, DRAFT, SUBMITTED, COMPLETED) */
        status?: "DRAFT" | "DELETED" | "FORMED" | "COMPLETED" | "REJECTED";
      },
      params: RequestParams = {},
    ) =>
      this.request<CalculateCpiDTO[], ErrorResponse>({
        path: `/api/calculate-cpi`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description Возвращает информацию о текущем черновике CPI для аутентифицированного пользователя.
     *
     * @tags CPI Calculation
     * @name GetDraftInfo
     * @summary Получить информацию о черновике
     * @request GET:/api/calculate-cpi/draft-info
     * @secure
     */
    getDraftInfo: (params: RequestParams = {}) =>
      this.request<DraftInfoDTO, ErrorResponse>({
        path: `/api/calculate-cpi/draft-info`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Удаляет черновик пользователя, если он является его владельцем и статус — DRAFT.
     *
     * @tags CPI Calculation
     * @name Delete2
     * @summary Удалить черновик расчета CPI
     * @request DELETE:/api/calculate-cpi/{draftId}
     * @secure
     */
    delete2: (draftId: number, params: RequestParams = {}) =>
      this.request<void, ErrorResponse | void>({
        path: `/api/calculate-cpi/${draftId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Принимает результаты асинхронной обработки заявки от внешнего сервиса. Доступно только с правильным токеном.
     *
     * @tags CPI Calculation
     * @name UpdateAsyncResult
     * @summary Обновить результаты асинхронной обработки
     * @request PUT:/api/calculate-cpi/{id}/async-result
     * @secure
     */
    updateAsyncResult: (
      id: number,
      data: {
        categories?: Array<{
          categoryId?: number;
          coefficient?: number | null;
          success?: boolean;
        }>;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, ErrorResponse>({
        path: `/api/calculate-cpi/${id}/async-result`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
}
