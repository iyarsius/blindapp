import QRCode from "qrcode";

export interface QRMatrix {
  modules: boolean[][];
  size: number;
}

interface GenerateSvgOptions {
  size: number;
  color: string;
  backgroundColor: string;
  outerEyeColor: string;
  innerEyeColor: string;
  outerEyeBorderRadius: number;
  innerEyeBorderRadius: number;
}

export async function generateQRMatrix(
  data: string,
  errorCorrectionLevel: "L" | "M" | "Q" | "H" = "M",
): Promise<QRMatrix> {
  const qr = await QRCode.create(data, { errorCorrectionLevel });
  const size = qr.modules.size;
  const modules: boolean[][] = [];

  for (let row = 0; row < size; row += 1) {
    modules[row] = [];

    for (let col = 0; col < size; col += 1) {
      modules[row][col] = qr.modules.get(row, col) === 1;
    }
  }

  return { modules, size };
}

function isEyeCell(row: number, col: number, size: number) {
  if (row < 7 && col < 7) {
    return true;
  }

  if (row < 7 && col >= size - 7) {
    return true;
  }

  if (row >= size - 7 && col < 7) {
    return true;
  }

  return false;
}

function circleToPath(cx: number, cy: number, r: number) {
  return `M${cx - r},${cy}a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 -${r * 2},0`;
}

function roundedRectToPath(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const safeRadius = Math.min(r, w / 2, h / 2);

  return `M${x + safeRadius},${y}h${w - 2 * safeRadius}a${safeRadius},${safeRadius} 0 0,1 ${safeRadius},${safeRadius}v${h - 2 * safeRadius}a${safeRadius},${safeRadius} 0 0,1 -${safeRadius},${safeRadius}h-${w - 2 * safeRadius}a${safeRadius},${safeRadius} 0 0,1 -${safeRadius},-${safeRadius}v-${h - 2 * safeRadius}a${safeRadius},${safeRadius} 0 0,1 ${safeRadius},-${safeRadius}z`;
}

export function generateQRCodeSvgContent(
  matrix: QRMatrix,
  options: GenerateSvgOptions,
) {
  const {
    size,
    color,
    backgroundColor,
    outerEyeColor,
    innerEyeColor,
    outerEyeBorderRadius,
    innerEyeBorderRadius,
  } = options;
  const moduleCount = matrix.size;
  const cellSize = size / moduleCount;
  const elements: string[] = [];
  const circlePathParts: string[] = [];

  elements.push(`<rect width="${size}" height="${size}" fill="${backgroundColor}"/>`);

  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      if (isEyeCell(row, col, moduleCount) || !matrix.modules[row][col]) {
        continue;
      }

      const cx = (col + 0.5) * cellSize;
      const cy = (row + 0.5) * cellSize;
      const r = (cellSize / 2) * 0.95;
      circlePathParts.push(circleToPath(cx, cy, r));
    }
  }

  if (circlePathParts.length > 0) {
    elements.push(`<path d="${circlePathParts.join("")}" fill="${color}"/>`);
  }

  const eyePositions = [
    { row: 0, col: 0 },
    { row: 0, col: moduleCount - 7 },
    { row: moduleCount - 7, col: 0 },
  ];
  const outerEyePaths: string[] = [];
  const innerHolePaths: string[] = [];
  const innerSquarePaths: string[] = [];

  for (const eye of eyePositions) {
    const x = eye.col * cellSize;
    const y = eye.row * cellSize;
    const eyeSize = 7 * cellSize;
    const borderWidth = cellSize;

    outerEyePaths.push(roundedRectToPath(x, y, eyeSize, eyeSize, outerEyeBorderRadius));
    innerHolePaths.push(
      roundedRectToPath(
        x + borderWidth,
        y + borderWidth,
        eyeSize - 2 * borderWidth,
        eyeSize - 2 * borderWidth,
        outerEyeBorderRadius * 0.6,
      ),
    );

    innerSquarePaths.push(
      roundedRectToPath(
        (eye.col + 2) * cellSize,
        (eye.row + 2) * cellSize,
        3 * cellSize,
        3 * cellSize,
        innerEyeBorderRadius,
      ),
    );
  }

  elements.push(`<path d="${outerEyePaths.join("")}" fill="${outerEyeColor}"/>`);
  elements.push(`<path d="${innerHolePaths.join("")}" fill="${backgroundColor}"/>`);
  elements.push(`<path d="${innerSquarePaths.join("")}" fill="${innerEyeColor}"/>`);

  return elements.join("");
}

export async function generateStyledQRCodeSvg(
  data: string,
  options: GenerateSvgOptions,
) {
  const matrix = await generateQRMatrix(data, "M");
  const content = generateQRCodeSvgContent(matrix, options);

  return `<svg viewBox="0 0 ${options.size} ${options.size}" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
}
