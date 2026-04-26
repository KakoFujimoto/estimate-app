export class CreateEstimateItemDto {
  name!: string;
  price!: number;
  quantity!: number;
}

export class CreateEstimateDto {
  title!: string;
  items!: CreateEstimateItemDto[];
}
