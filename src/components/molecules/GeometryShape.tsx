import React from 'react';
import { Question } from '@/types/quiz';
import './GeometryShape.css';

interface GeometryShapeProps {
  shape: NonNullable<Question["shape"]>;
}

export const GeometryShape: React.FC<GeometryShapeProps> = ({ shape }) => {
  const { type, dimensions, svgPath } = shape;

  const renderDimensions = () => {
    switch (type) {
      case "triangle":
        if (dimensions.length === 2) {
          return (
            <div className="shape-dimensions">
              <span>Base: {dimensions[0]} units</span>
              <span>Height: {dimensions[1]} units</span>
            </div>
          );
        } else {
          return (
            <div className="shape-dimensions">
              <span>
                Sides: {dimensions[0]}, {dimensions[1]}, {dimensions[2]} units
              </span>
            </div>
          );
        }
      case "rectangle":
        return (
          <div className="shape-dimensions">
            <span>Length: {dimensions[0]} units</span>
            <span>Width: {dimensions[1]} units</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="geometry-shape">
      <svg
        width="240"
        height="120"
        viewBox="0 0 240 120"
        className="shape-svg"
      >
        <defs>
          <linearGradient
            id="shapeGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#fdcb3f" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#b8941f" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <path
          d={svgPath}
          fill="url(#shapeGradient)"
          stroke="#fdcb3f"
          strokeWidth="2"
          className="shape-path"
        />
        {type === "rectangle" && (
          <>
            <text
              x={120}
              y={60 - (dimensions[1] * 8) / 2 - 5}
              fill="#fdcb3f"
              fontSize="10"
              textAnchor="middle"
            >
              {dimensions[0]}
            </text>
            <text
              x={120 - (dimensions[0] * 8) / 2 - 10}
              y={60}
              fill="#fdcb3f"
              fontSize="10"
              textAnchor="middle"
            >
              {dimensions[1]}
            </text>
          </>
        )}
      </svg>
      {renderDimensions()}
    </div>
  );
};
