export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export class HeadingIdGenerator {
  private idMap = new Map<string, number>();
  private counter = 0;

  generate(text: string): string {
    let id = text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    if (id) {
      const count = this.idMap.get(id);
      if (count !== undefined) {
        this.idMap.set(id, count + 1);
        id = `${id}-${count + 1}`;
      } else {
        this.idMap.set(id, 1);
      }
    } else {
      this.counter += 1;
      id = `heading-${this.counter}`;
    }

    return id;
  }

  reset(): void {
    this.idMap.clear();
    this.counter = 0;
  }
}

export function extractTocItems(content: string): TocItem[] {
  const items: TocItem[] = [];
  const generator = new HeadingIdGenerator();
  const lines = content.split('\n');

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = generator.generate(text);
      items.push({ id, text, level });
    }
  }

  return items;
}
