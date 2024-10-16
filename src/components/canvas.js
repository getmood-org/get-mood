import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer, Star, Text, Transformer, Image as KonvaImage } from "react-konva";

// Function to generate initial stars
function generateStars(count = 2) {
  return [...Array(count)].map((_, i) => ({
    id: `star-${i}`,
    type: 'star',
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    rotation: Math.random() * 180,
    innerRadius: 20,
    outerRadius: 40,
    fill: "yellow",
    stroke: "black",
    strokeWidth: 2,
  }));
}

// Component for rendering and transforming a Star
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
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...star,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            innerRadius: Math.max(5, star.innerRadius * scaleX),
            outerRadius: Math.max(5, star.outerRadius * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

// Component for rendering and transforming an Image
const ImageShape = ({ imageObj, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [image, setImage] = useState(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = imageObj.src;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      setImage(img);
    };
  }, [imageObj.src]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={image}
        {...imageObj}
        onClick={onSelect}
        onTap={onSelect}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...imageObj,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...imageObj,
            x: node.x(),
            y: node.y(),
            width: Math.max(10, imageObj.width * scaleX),
            height: Math.max(10, imageObj.height * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

// Main Canvas Component
const Canvas = () => {
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const [stars, setStars] = useState(generateStars());
  const [images, setImages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const resizeHandler = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  const handleSelect = (id, type) => {
    setSelectedId(id);
    setSelectedType(type);
  };

  const handleChangeStar = (newAttrs) => {
    const updatedStars = stars.map((star) =>
      star.id === newAttrs.id ? newAttrs : star
    );
    setStars(updatedStars);
  };

  const handleChangeImage = (newAttrs) => {
    const updatedImages = images.map((img) =>
      img.id === newAttrs.id ? newAttrs : img
    );
    setImages(updatedImages);
  };

  const handleDeselect = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
      setSelectedType(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new window.Image();
        img.src = evt.target.result;
        img.onload = () => {
          const newImage = {
            id: `image-${images.length}`,
            type: "image",
            x: 100,
            y: 100,
            width: img.width > 200 ? 200 : img.width,
            height: img.height > 200 ? 200 : img.height,
            src: evt.target.result,
          };
          setImages([...images, newImage]);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.02;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    let newScale = oldScale;
    const minScale = 0.5;
    const maxScale = 3;

    if (e.evt.deltaY < 0) {
      newScale = Math.min(oldScale * scaleBy, maxScale);
    } else {
      newScale = Math.max(oldScale / scaleBy, minScale);
    }
    setScale(newScale);
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });

    stage.scale({ x: newScale, y: newScale });
    stage.position({ x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
    stage.batchDraw();
  };

  return (
    <div
      ref={containerRef}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      tabIndex={0}
      className="w-full h-screen"
      style={{ outline: "none" }}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleWheel}
        onMouseDown={handleDeselect}
        onTouchStart={handleDeselect}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
      >
        <Layer>
          <Text text="Try to drag a star or drop an image" />
          {stars.map((star) => (
            <StarShape
              key={star.id}
              star={star}
              isSelected={star.id === selectedId && selectedType === "star"}
              onSelect={() => handleSelect(star.id, "star")}
              onChange={handleChangeStar}
            />
          ))}
          {images.map((imageObj) => (
            <ImageShape
              key={imageObj.id}
              imageObj={imageObj}
              isSelected={imageObj.id === selectedId && selectedType === "image"}
              onSelect={() => handleSelect(imageObj.id, "image")}
              onChange={handleChangeImage}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;
