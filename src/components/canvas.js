import React, { useRef, useEffect } from "react";
import { Stage, Layer, Star, Text, Transformer } from "react-konva";

function generateShapes() {
  return [...Array(10)].map((_, i) => ({
    id: i.toString(),
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    rotation: Math.random() * 180,
    innerRadius: 20,
    outerRadius: 40,
    fill: "yellow",
    stroke: "black",
    strokeWidth: 2,
    isDragging: false,
  }));
}

const INITIAL_STATE = generateShapes();

const StarShape = ({ star, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Star
        ref={shapeRef}
        {...star}
        onClick={onSelect}
        onTap={onSelect}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...star,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

const Canvas = () => {
  const [stars, setStars] = React.useState(INITIAL_STATE);
  const [selectedId, setSelectedId] = React.useState(null);

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleChange = (newAttrs) => {
    const updatedStars = stars.map((star) =>
      star.id === newAttrs.id ? newAttrs : star
    );
    setStars(updatedStars);
  };

  const handleDeselect = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  };

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={handleDeselect}
      onTouchStart={handleDeselect}
    >
      <Layer>
        <Text text="Try to drag a star" />
        {stars.map((star) => (
          <StarShape
            key={star.id}
            star={star}
            isSelected={star.id === selectedId}
            onSelect={() => handleSelect(star.id)}
            onChange={handleChange}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default Canvas;
