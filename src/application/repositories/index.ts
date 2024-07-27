export default abstract class IRepository<
  Schema = unknown,
  CreateParams = unknown,
  FindParams = unknown,
  UpdateParams = unknown,
  DeleteParams = unknown,
> {
  abstract create(data: CreateParams): Promise<Schema>;

  abstract find(query: FindParams): Promise<Schema[]>;

  abstract update(data: UpdateParams): Promise<Schema>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  count(query: FindParams): Promise<number> {
    throw new Error('Method not implemented.');
  }

  abstract delete(id: string): Promise<boolean>;

  abstract deleteMany(params: DeleteParams): Promise<{ matchedCount: number }>;
}
