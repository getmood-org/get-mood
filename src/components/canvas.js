import { Stage, Layer, Star, Text, Transformer, Image as KonvaImage } from 'react-konva';
import React, { useRef, useState, useEffect } from 'react';

function generateShapes() {
  return [...Array(10)].map((_, i) => ({
    id: i.toString(),
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    rotation: Math.random() * 180,
    innerRadius: 20,
    outerRadius: 40,
    fill: 'yellow',
    stroke: 'black',
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
  const stageRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [stars, setStars] = useState(INITIAL_STATE);
  const [selectedId, setSelectedId] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const resizeHandler = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', resizeHandler);
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

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

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target?.result;
      img.onload = () => {
        setImage(img);
      };
    };

    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
  };

  return (
    <div onDrop={handleDrop} onDragOver={handleDrag} className="w-full h-screen">
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleDeselect}
        onTouchStart={handleDeselect}
        style={{ backgroundColor: 'white' }}
      >
        <Layer>
          <Text text="Try to drag a star or drop an image" />
          {stars.map((star) => (
            <StarShape
              key={star.id}
              star={star}
              isSelected={star.id === selectedId}
              onSelect={() => handleSelect(star.id)}
              onChange={handleChange}
            />
          ))}
          {image && (
            <KonvaImage
              image={image}
              x={100}
              y={100}
              width={200}
              height={200}
              draggable
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;
