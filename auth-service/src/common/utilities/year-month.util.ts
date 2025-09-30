export class YearMonth {
  constructor(
    public year: number,
    public month: number,
  ) {}

  static fromDate(date: Date): YearMonth {
    return new YearMonth(date.getFullYear(), date.getMonth() + 1);
  }

  toString(): string {
    const m = this.month.toString().padStart(2, '0');
    return `${m}/${this.year}`;
  }
}
