import type { DeleteOptions } from '../types/common';
import type { CreateFieldInput, UpdateFieldInput } from '../types/collections';

export function normalizeFieldInput<T extends CreateFieldInput | UpdateFieldInput>(input: T): T {
  if (input.label || !input.name) {
    return input;
  }

  return {
    ...input,
    label: input.name,
  };
}

export function toDeleteBody(options?: DeleteOptions): DeleteOptions | undefined {
  if (!options?.deleteMediaIds || options.deleteMediaIds.length === 0) {
    return undefined;
  }

  return {
    deleteMediaIds: options.deleteMediaIds,
  };
}
