import { Stage, Layer, Rect } from 'react-konva';
import React, { useRef, useState, useEffect } from 'react';

const Canvas: React.FC = () => {
    const stageRef = useRef<any>(null);
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    useEffect(()=>{
        const resizeHandler = ()=>{
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        addEventListener('resize',resizeHandler);
        return()=>{
            removeEventListener('resize',resizeHandler);
        };
    },[]);
    return(<Stage
        ref = {stageRef}
        width={dimensions.width}
        height = {dimensions.height}
        style={{backgroundColor: 'white'}}
        >
            <Layer>
                <Rect
                x={50}
                y={50}
                width={100}
                height={100}
                fill='blue'
                draggable
                />
            </Layer>
        </Stage>
    );
};

export default Canvas;