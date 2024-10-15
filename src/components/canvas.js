import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import React, { useRef, useState, useEffect } from 'react';

const Canvas = () => {
  const stageRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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

  const [image, setImage] = useState(null);

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
    <div
      onDrop={handleDrop}
      onDragOver={handleDrag}
      className="w-full h-screen"
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ backgroundColor: 'white' }}
      >
        <Layer>
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
