import { DomainException } from '@cashfarm/plow';

export type ValidationErrors<T> = Partial<Record<keyof T, { messages: string[] }>>;

export class ValidationException<T> extends DomainException {
  constructor(message: string, public readonly errors: ValidationErrors<T>) {
    super(message);
  }
}
