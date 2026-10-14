import { Numbers } from './Numbers.js';

/** Immutable affine value object. Parsing SVG syntax belongs to infrastructure. */
export class AffineTransform {
  constructor(
    private readonly a = 1, private readonly b = 0,
    private readonly c = 0, private readonly d = 1,
    private readonly e = 0, private readonly f = 0,
  ) {
    [a, b, c, d, e, f].forEach(value => Numbers.finite(value, 'transform'));
    if (!Number.isFinite(a * d - b * c) || a * d - b * c === 0) {
      throw new Error('non-invertible transform');
    }
  }

  multiply(right: AffineTransform): AffineTransform {
    return new AffineTransform(
      this.a * right.a + this.c * right.b, this.b * right.a + this.d * right.b,
      this.a * right.c + this.c * right.d, this.b * right.c + this.d * right.d,
      this.a * right.e + this.c * right.f + this.e,
      this.b * right.e + this.d * right.f + this.f,
    );
  }

  inverse(): AffineTransform {
    const det = this.a * this.d - this.b * this.c;
    return new AffineTransform(this.d / det, -this.b / det, -this.c / det, this.a / det,
      (this.c * this.f - this.d * this.e) / det,
      (this.b * this.e - this.a * this.f) / det);
  }

  vector(x: number, y: number): readonly [number, number] {
    return [Numbers.finite(this.a * x + this.c * y, 'dx'),
      Numbers.finite(this.b * x + this.d * y, 'dy')];
  }

  point(x: number, y: number): readonly [number, number] {
    const [dx, dy] = this.vector(x, y);
    return [Numbers.finite(dx + this.e, 'x'), Numbers.finite(dy + this.f, 'y')];
  }

  scaleTranslation(factor: number): AffineTransform {
    return new AffineTransform(this.a, this.b, this.c, this.d, this.e * factor, this.f * factor);
  }

  get isIdentity(): boolean {
    return this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1 && this.e === 0 && this.f === 0;
  }

  toSvg(): string {
    return `matrix(${[this.a, this.b, this.c, this.d, this.e, this.f].map(Numbers.format).join(' ')})`;
  }
}
