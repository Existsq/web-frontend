import type { Category } from '../types';

/**
 * Моки данных для категорий услуг
 * Используются для разработки и тестирования без подключения к API
 */
export const mockCategories: Category[] = [
  {
    id: 1,
    title: 'Образовательные услуги',
    shortDescription: 'Услуги в сфере образования и обучения',
    description: 'Комплексные образовательные услуги, включающие обучение в школах, университетах, курсы повышения квалификации и профессиональную подготовку. Включает расходы на учебные материалы, оборудование и методические пособия.',
    basePrice: 15000,
    imageUUID: 'education-uuid-001',
    status: 'ACTIVE',
  },
  {
    id: 2,
    title: 'Медицинские услуги',
    shortDescription: 'Услуги здравоохранения и медицинского обслуживания',
    description: 'Медицинские услуги включают консультации врачей, диагностику, лечение, профилактические осмотры, стоматологические услуги и фармацевтические препараты. Охватывает как платные, так и частично оплачиваемые медицинские услуги.',
    basePrice: 3500,
    imageUUID: 'medical-uuid-002',
    status: 'ACTIVE',
  },
  {
    id: 3,
    title: 'Транспортные услуги',
    shortDescription: 'Услуги общественного и частного транспорта',
    description: 'Транспортные услуги включают проезд в общественном транспорте (автобусы, трамваи, метро), такси, услуги каршеринга, аренду автомобилей и расходы на топливо для личного транспорта.',
    basePrice: 2500,
    imageUUID: 'transport-uuid-003',
    status: 'ACTIVE',
  },
  {
    id: 4,
    title: 'Коммунальные услуги',
    shortDescription: 'Жилищно-коммунальные услуги',
    description: 'Коммунальные услуги включают оплату электроэнергии, водоснабжения, водоотведения, отопления, газоснабжения, вывоза мусора и управление многоквартирными домами.',
    basePrice: 4500,
    imageUUID: 'utilities-uuid-004',
    status: 'ACTIVE',
  },
  {
    id: 5,
    title: 'Услуги связи',
    shortDescription: 'Телефонная связь, интернет и телевидение',
    description: 'Услуги связи включают мобильную и стационарную телефонную связь, интернет-услуги, кабельное и спутниковое телевидение, а также различные пакеты услуг от провайдеров.',
    basePrice: 1200,
    imageUUID: 'telecom-uuid-005',
    status: 'ACTIVE',
  },
  {
    id: 6,
    title: 'Бытовые услуги',
    shortDescription: 'Ремонт, уборка и другие бытовые услуги',
    description: 'Бытовые услуги включают ремонт бытовой техники, сантехнические работы, услуги по уборке, химчистку, прачечную, парикмахерские услуги и другие сервисы для дома.',
    basePrice: 2800,
    imageUUID: 'household-uuid-006',
    status: 'ACTIVE',
  },
  {
    id: 7,
    title: 'Культурные и развлекательные услуги',
    shortDescription: 'Кино, театры, музеи и развлечения',
    description: 'Культурные и развлекательные услуги включают посещение кинотеатров, театров, музеев, выставок, концертов, спортивных мероприятий, развлекательных центров и парков развлечений.',
    basePrice: 1800,
    imageUUID: 'entertainment-uuid-007',
    status: 'ACTIVE',
  },
  {
    id: 8,
    title: 'Финансовые услуги',
    shortDescription: 'Банковские и страховые услуги',
    description: 'Финансовые услуги включают банковское обслуживание, кредитные услуги, страховые услуги, инвестиционные услуги, услуги по переводу денежных средств и другие финансовые операции.',
    basePrice: 500,
    imageUUID: 'financial-uuid-008',
    status: 'ACTIVE',
  },
  {
    id: 9,
    title: 'Туристические услуги',
    shortDescription: 'Туры, отели и туристические услуги',
    description: 'Туристические услуги включают организацию туров, бронирование отелей, услуги турагентств, экскурсионные услуги, визовую поддержку и другие услуги в сфере туризма.',
    basePrice: 25000,
    imageUUID: 'tourism-uuid-009',
    status: 'ACTIVE',
  },
  {
    id: 10,
    title: 'Спортивные услуги',
    shortDescription: 'Фитнес, спортзалы и спортивные секции',
    description: 'Спортивные услуги включают абонементы в фитнес-клубы, спортивные секции, бассейны, услуги персональных тренеров, аренду спортивного инвентаря и спортивные мероприятия.',
    basePrice: 3200,
    imageUUID: 'sports-uuid-010',
    status: 'ACTIVE',
  },
  {
    id: 11,
    title: 'Юридические услуги',
    shortDescription: 'Консультации и представительство в суде',
    description: 'Юридические услуги включают консультации юристов, составление документов, представительство в суде, нотариальные услуги, регистрацию бизнеса и другие правовые услуги.',
    basePrice: 5000,
    imageUUID: 'legal-uuid-011',
    status: 'ACTIVE',
  },
  {
    id: 12,
    title: 'Услуги общественного питания',
    shortDescription: 'Рестораны, кафе и доставка еды',
    description: 'Услуги общественного питания включают посещение ресторанов, кафе, баров, услуги доставки еды, кейтеринг и другие услуги в сфере питания вне дома.',
    basePrice: 1500,
    imageUUID: 'restaurant-uuid-012',
    status: 'ACTIVE',
  },
];

/**
 * Функция для фильтрации моков по названию
 */
export const filterMockCategories = (title?: string): Category[] => {
  if (!title) {
    return mockCategories;
  }
  
  const searchLower = title.toLowerCase();
  return mockCategories.filter(
    (category) =>
      category.title.toLowerCase().includes(searchLower) ||
      category.shortDescription.toLowerCase().includes(searchLower) ||
      category.description?.toLowerCase().includes(searchLower)
  );
};

/**
 * Функция для получения категории по ID из моков
 */
export const getMockCategoryById = (id: string | number): Category | null => {
  return mockCategories.find((category) => category.id === id) || null;
};

