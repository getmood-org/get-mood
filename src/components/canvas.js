import React, { useRef, useEffect,useState } from "react";
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
  const [stage,setStage] = useState({
    scale: 1,
    x: 0,
    y: 0
  });
  const handleWheel = (e) => {
    e.evt.preventDefault();

    const scaleBy = 1.02;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setStage({
      scale: newScale,
      x: (stage.getPointerPosition().x / newScale - mousePointTo.x) * newScale,
      y: (stage.getPointerPosition().y / newScale - mousePointTo.y) * newScale
    });
  };  

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
      onWheel={handleWheel}
      onMouseDown={handleDeselect}
      onTouchStart={handleDeselect}
      scaleX={stage.scale}
      scaleY={stage.scale}
      x={stage.x}
      y={stage.y}
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
