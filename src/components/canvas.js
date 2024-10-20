// src/Canvas.js
import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer, Transformer, Image as KonvaImage } from "react-konva";
import { Button } from "./ui/button";

// Component for rendering and transforming an Image
const ImageShape = ({ imageObj, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [image, setImage] = useState(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = imageObj.src;
    img.crossOrigin = "Anonymous"; // If necessary
    img.onload = () => {
      setImage(img);
    };
    img.onerror = (err) => {
      console.error(`Failed to load image: ${imageObj.id}`, err);
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
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (
              Math.abs(newBox.width) < 10 ||
              Math.abs(newBox.height) < 10
            ) {
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
  const [images, setImages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Panning state
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState({ x: 0, y: 0 });

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

  const handleChangeImage = (newAttrs) => {
    const updatedImages = images.map((img) =>
      img.id === newAttrs.id ? newAttrs : img
    );
    setImages(updatedImages);
  };

  const handleDeselect = (e) => {
    // Only deselect if clicked on the background
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
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
            id: `image-${Date.now()}`, // Use timestamp for unique ID
            type: "image",
            x:
              position.x +
              (dimensions.width / 2) / scale -
              (img.width > 200 ? 100 : img.width / 2),
            y:
              position.y +
              (dimensions.height / 2) / scale -
              (img.height > 200 ? 100 : img.height / 2),
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

  // Handle Wheel for Zooming
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const scaleBy = 1.02;
    let newScale = oldScale;

    if (e.evt.deltaY < 0) {
      newScale = Math.min(oldScale * scaleBy, 3);
    } else {
      newScale = Math.max(oldScale / scaleBy, 0.3);
    }

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setScale(newScale);
    setPosition(newPos);
  };

  // Handle Mouse Down for Panning
  const handleMouseDown = (e) => {
    // Only start panning if clicked on the background
    if (e.target === stageRef.current) {
      setIsPanning(true);
      const pos = e.evt.clientX
        ? { x: e.evt.clientX, y: e.evt.clientY }
        : { x: 0, y: 0 };
      setLastPanPos(pos);
    }
  };

  // Handle Mouse Move for Panning
  const handleMouseMove = (e) => {
    if (!isPanning) return;

    const stage = stageRef.current;
    if (!stage) return;

    const pos = {
      x: e.evt.clientX,
      y: e.evt.clientY,
    };

    const dx = pos.x - lastPanPos.x;
    const dy = pos.y - lastPanPos.y;

    const newPos = {
      x: stage.x() + dx,
      y: stage.y() + dy,
    };

    setLastPanPos(pos);
    setPosition(newPos);
  };

  // Handle Mouse Up to End Panning
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }
  };

  const handleExportAsImage = () => {
    const stage = stageRef.current;
    if (!stage) return;
    // Get the data URL of the stage
    const dataURL = stage.toDataURL({ pixelRatio: 3 }); // Increase pixelRatio for higher resolution
    // Create a link and trigger download
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "canvas.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAsJSON = () => {
    const canvasState = {
      images,
      scale,
      position,
    };

    const json = JSON.stringify(canvasState);

    // Create a Blob from the JSON
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create a link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = "canvas.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up
  };

  const handleImportFromJSON = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = () => {
        const json = reader.result;
        try {
          const canvasState = JSON.parse(json);

          // Validate the canvasState object
          if (canvasState.images && canvasState.scale && canvasState.position) {
            setImages(canvasState.images);
            setScale(canvasState.scale);
            setPosition(canvasState.position);
          } else {
            throw new Error("Invalid canvas state");
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
          alert("Failed to load the canvas. Error: " + error.message);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid JSON file.");
    }
  };

  return (
    <div
      ref={containerRef}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      tabIndex={0}
      className={`w-full h-screen outline-none overflow-hidden ${
        isPanning ? "cursor-grabbing" : "cursor-default"
      }`}
    >
      {/* Export and Import Controls */}
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
        <Button variant={"outline"} onClick={handleExportAsImage}>
          Export as Image
        </Button>
        <Button
          variant={"outline"}
          onClick={handleExportAsJSON}
          style={{ marginLeft: "10px" }}
        >
          Export as JSON
        </Button>
        <input
          type="file"
          accept="application/json"
          onChange={handleImportFromJSON}
          style={{ marginLeft: "10px" }}
        />
      </div>

      {/* Konva Stage */}
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchEnd={handleMouseUp}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onClick={handleDeselect}
        onTap={handleDeselect}
        draggable={false} // Disable default dragging
      >
        <Layer>
          {/* Render Images */}
          {images.map((imageObj) => (
            <ImageShape
              key={imageObj.id}
              imageObj={imageObj}
              isSelected={
                imageObj.id === selectedId && selectedType === "image"
              }
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
