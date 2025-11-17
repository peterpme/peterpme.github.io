import React, { useState, useMemo } from 'react';

// Round to nearest tape measure fraction (1/16th inch increments)
function roundToTapeMeasure(decimal) {
  const sixteenths = Math.round(decimal * 16);
  const whole = Math.floor(sixteenths / 16);
  const remainder = sixteenths % 16;
  
  if (remainder === 0) {
    return whole === 0 ? '0' : `${whole}`;
  }
  
  // Simplify the fraction
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(remainder, 16);
  const numerator = remainder / divisor;
  const denominator = 16 / divisor;
  
  if (whole === 0) {
    return `${numerator}/${denominator}`;
  }
  
  return `${whole} ${numerator}/${denominator}`;
}

export default function ChristmasLightDesigner() {
  const [numLights, setNumLights] = useState(25);
  const [frameWidth, setFrameWidth] = useState(59);
  const [frameHeight, setFrameHeight] = useState(32);
  const [cornerOffset, setCornerOffset] = useState(4);

  // Calculate light positions around the perimeter
  const { lightPositions, lightsPerSide, actualSpacing } = useMemo(() => {
    const positions = [];
    
    // Calculate effective perimeter (excluding corner offsets)
    const topLength = frameWidth - 2 * cornerOffset;
    const rightLength = frameHeight - 2 * cornerOffset;
    const bottomLength = frameWidth - 2 * cornerOffset;
    const leftLength = frameHeight - 2 * cornerOffset;
    const perimeter = topLength + rightLength + bottomLength + leftLength;
    const calculatedSpacing = perimeter / numLights;
    
    // Round spacing to nearest 1/16th inch
    const roundedSpacing = Math.round(calculatedSpacing * 16) / 16;

    // Start from center of top edge
    const startOffset = topLength / 2;

    // Count lights per side
    let topCount = 0, rightCount = 0, bottomCount = 0, leftCount = 0;

    for (let i = 0; i < numLights; i++) {
      const currentDistance = (i * calculatedSpacing + startOffset) % perimeter;
      let x, y;

      // Top edge
      if (currentDistance < topLength) {
        x = cornerOffset + currentDistance;
        y = 0;
        topCount++;
      }
      // Right edge
      else if (currentDistance < topLength + rightLength) {
        x = frameWidth;
        y = cornerOffset + (currentDistance - topLength);
        rightCount++;
      }
      // Bottom edge
      else if (currentDistance < topLength + rightLength + bottomLength) {
        x = frameWidth - cornerOffset - (currentDistance - topLength - rightLength);
        y = frameHeight;
        bottomCount++;
      }
      // Left edge
      else {
        x = 0;
        y = frameHeight - cornerOffset - (currentDistance - topLength - rightLength - bottomLength);
        leftCount++;
      }

      positions.push({ x, y, index: i });
    }

    return {
      lightPositions: positions,
      lightsPerSide: { top: topCount, right: rightCount, bottom: bottomCount, left: leftCount },
      actualSpacing: roundedSpacing
    };
  }, [numLights, frameWidth, frameHeight, cornerOffset]);

  const perimeter = 2 * (frameWidth - 2 * cornerOffset) + 2 * (frameHeight - 2 * cornerOffset);
  const padding = 20;
  const scale = 8;
  const viewBoxWidth = frameWidth * scale + padding * 2;
  const viewBoxHeight = frameHeight * scale + padding * 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-green-900 to-red-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            🎄 Christmas Light Window Frame Designer 🎄
          </h1>
          <p className="text-green-100 text-lg">
            Design your perfect light arrangement
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-2xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Lights
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={numLights}
                onChange={(e) => setNumLights(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:border-red-500 text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Frame Width (inches)
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={frameWidth}
                onChange={(e) => setFrameWidth(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:border-red-500 text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Frame Height (inches)
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={frameHeight}
                onChange={(e) => setFrameHeight(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:border-red-500 text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Corner Offset (inches)
                <span className="text-gray-500 text-xs ml-2">(Distance from corners)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={cornerOffset}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || val === '-') {
                    setCornerOffset(0);
                  } else {
                    setCornerOffset(Math.max(0, parseFloat(val) || 0));
                  }
                }}
                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:border-red-500 text-lg"
              />
            </div>

            <div className="bg-gradient-to-r from-red-50 to-green-50 rounded-lg p-4 space-y-2 border-2 border-green-200">
              <h3 className="font-bold text-gray-800 text-lg mb-3">📐 Calculations</h3>
              <div className="space-y-1 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-600">Corner Offset:</span>
                  <span className="font-semibold text-gray-800">
                    {roundToTapeMeasure(cornerOffset)}"
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Total Perimeter:</span>
                  <span className="font-semibold text-gray-800">
                    {roundToTapeMeasure(perimeter)}"
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Spacing Between Lights:</span>
                  <span className="font-semibold text-gray-800 bg-yellow-100 px-2 py-1 rounded">
                    {roundToTapeMeasure(actualSpacing)}"
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Lights per Side:</span>
                  <span className="font-semibold text-gray-800">
                    Top: {lightsPerSide.top} lights
                  </span>
                </p>
                <p className="flex justify-between pl-4">
                  <span className="text-gray-600"></span>
                  <span className="font-semibold text-gray-800">
                    Right: {lightsPerSide.right} lights
                  </span>
                </p>
                <p className="flex justify-between pl-4">
                  <span className="text-gray-600"></span>
                  <span className="font-semibold text-gray-800">
                    Bottom: {lightsPerSide.bottom} lights
                  </span>
                </p>
                <p className="flex justify-between pl-4">
                  <span className="text-gray-600"></span>
                  <span className="font-semibold text-gray-800">
                    Left: {lightsPerSide.left} lights
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-2xl p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4 text-center">
              Light Preview
            </h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <svg
                viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                className="w-full h-auto"
                style={{ maxHeight: '500px' }}
              >
                <rect
                  x={padding}
                  y={padding}
                  width={frameWidth * scale}
                  height={frameHeight * scale}
                  fill="none"
                  stroke="#4a5568"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                />

                {cornerOffset > 0 && (
                  <>
                    <line x1={padding + cornerOffset * scale} y1={padding - 10} x2={padding + cornerOffset * scale} y2={padding + 10} stroke="#ff6b6b" strokeWidth="2" strokeDasharray="3,3"/>
                    <line x1={padding - 10} y1={padding + cornerOffset * scale} x2={padding + 10} y2={padding + cornerOffset * scale} stroke="#ff6b6b" strokeWidth="2" strokeDasharray="3,3"/>
                    <line x1={padding + (frameWidth - cornerOffset) * scale} y1={padding - 10} x2={padding + (frameWidth - cornerOffset) * scale} y2={padding + 10} stroke="#ff6b6b" strokeWidth="2" strokeDasharray="3,3"/>
                    <line x1={padding + frameWidth * scale - 10} y1={padding + cornerOffset * scale} x2={padding + frameWidth * scale + 10} y2={padding + cornerOffset * scale} stroke="#ff6b6b" strokeWidth="2" strokeDasharray="3,3"/>
                    <line x1={padding + (frameWidth - cornerOffset) * scale} y1={padding + frameHeight * scale - 10} x2={padding + (frameWidth - cornerOffset) * scale} y2={padding + frameHeight * scale + 10} stroke="#ff6b6b" strokeWidth="2" strokeDasharray="3,3"/>
                    <line x1={padding + frameWidth * scale - 10} y1={padding + (frameHeight - cornerOffset) * scale} x2={padding + frameWidth * scale + 10} y2={padding + (frameHeight - cornerOffset) * scale} stroke="#ff6b6b" strokeWidth="2" strokeDasharray="3,3"/>
                    <line x1={padding + cornerOffset * scale} y1={padding + frameHeight * scale - 10} x2={padding + cornerOffset * scale} y2={padding + frameHeight * scale + 10} stroke="#ff6b6b" strokeWidth="2" strokeDasharray="3,3"/>
                    <line x1={padding - 10} y1={padding + (frameHeight - cornerOffset) * scale} x2={padding + 10} y2={padding + (frameHeight - cornerOffset) * scale} stroke="#ff6b6b" strokeWidth="2" strokeDasharray="3,3"/>
                  </>
                )}

                {lightPositions.map((pos, idx) => {
                  const colors = ['#ffd700', '#ff0000', '#00ff00', '#0000ff', '#ff69b4', '#ffffff'];
                  const color = colors[idx % colors.length];
                  const delay = idx * 0.1;
                  const isFirst = idx === 0;
                  
                  return (
                    <g key={idx}>
                      {isFirst && (
                        <>
                          <circle cx={padding + pos.x * scale} cy={padding + pos.y * scale} r="20" fill="none" stroke="#00ff00" strokeWidth="3">
                            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
                          </circle>
                          <text x={padding + pos.x * scale} y={padding + pos.y * scale - 30} fill="#00ff00" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="Arial, sans-serif">
                            START
                          </text>
                          <path d={`M ${padding + pos.x * scale} ${padding + pos.y * scale - 25} L ${padding + pos.x * scale - 4} ${padding + pos.y * scale - 18} L ${padding + pos.x * scale + 4} ${padding + pos.y * scale - 18} Z`} fill="#00ff00">
                            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
                          </path>
                        </>
                      )}
                      
                      <circle cx={padding + pos.x * scale} cy={padding + pos.y * scale} r="12" fill={color} opacity="0.3">
                        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" begin={`${delay}s`}/>
                      </circle>
                      <circle cx={padding + pos.x * scale} cy={padding + pos.y * scale} r={isFirst ? "8" : "6"} fill={color} stroke={isFirst ? "#00ff00" : "#ffffff"} strokeWidth={isFirst ? "2" : "1"}>
                        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" begin={`${delay}s`}/>
                      </circle>
                    </g>
                  );
                })}
              </svg>
            </div>
            <p className="text-center text-gray-600 text-sm mt-4">
              {numLights} lights evenly distributed around your {frameWidth} × {frameHeight}" frame
              {cornerOffset > 0 && ` with ${roundToTapeMeasure(cornerOffset)}" offset from corners`}
            </p>
            
            <div className="mt-6 bg-gray-100 rounded-lg p-4 border-2 border-gray-300">
              <h4 className="font-bold text-gray-800 text-sm mb-3 text-center">
                📏 Spacing Guide (Distance Between Lights)
              </h4>
              <div className="bg-white rounded p-4">
                <svg viewBox="0 0 400 80" className="w-full">
                  <circle cx="40" cy="40" r="8" fill="#ffd700" stroke="#ffffff" strokeWidth="2"/>
                  <circle cx="40" cy="40" r="14" fill="#ffd700" opacity="0.3"/>
                  <circle cx="360" cy="40" r="8" fill="#ff0000" stroke="#ffffff" strokeWidth="2"/>
                  <circle cx="360" cy="40" r="14" fill="#ff0000" opacity="0.3"/>
                  <defs>
                    <marker id="arrowLeft" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                      <polygon points="10,5 0,0 0,10" fill="#333"/>
                    </marker>
                    <marker id="arrowRight" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                      <polygon points="0,5 10,0 10,10" fill="#333"/>
                    </marker>
                  </defs>
                  <line x1="60" y1="40" x2="340" y2="40" stroke="#333" strokeWidth="2" markerStart="url(#arrowLeft)" markerEnd="url(#arrowRight)"/>
                  <rect x="170" y="20" width="60" height="25" fill="white" stroke="#333" strokeWidth="1" rx="3"/>
                  <text x="200" y="37" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#333">
                    {roundToTapeMeasure(actualSpacing)}"
                  </text>
                  <line x1="60" y1="35" x2="60" y2="45" stroke="#666" strokeWidth="1"/>
                  <line x1="340" y1="35" x2="340" y2="45" stroke="#666" strokeWidth="1"/>
                </svg>
                <p className="text-center text-gray-600 text-xs mt-2">
                  Use a tape measure to mark {roundToTapeMeasure(actualSpacing)}" between each light
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
