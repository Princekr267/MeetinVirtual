import React, { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import "../../styles/whiteboard.css";
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import EditIcon from '@mui/icons-material/Edit';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import LayersClearIcon from '@mui/icons-material/LayersClear';

const bgDark = "#1e293b";

// Preset colors for quick mobile tapping
const PRESET_COLORS = [
  "#4ade80", // Emerald Green (default)
  "#38bdf8", // Sky Blue
  "#f87171", // Coral Red
  "#fbbf24", // Warm Amber
  "#ffffff", // Pure White
];

const Whiteboard = ({ socket, roomId, onClose, isOpen }) => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const wrapperRef = useRef(null);

  const [tool, setTool] = useState("pencil"); // 'pencil' | 'select' | 'eraser' | 'rect' | 'circle' | 'text'
  const [color, setColor] = useState("#4ade80");
  const [lineWidth, setLineWidth] = useState(3);
  const [hasSelection, setHasSelection] = useState(false);

  // Undo / Redo state
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const historyRef = useRef([]);
  const historyPos = useRef(-1);
  const isSyncing = useRef(false);

  // Stale closure guards
  const toolRef = useRef(tool);
  toolRef.current = tool;
  const colorRef = useRef(color);
  colorRef.current = color;
  const lineWidthRef = useRef(lineWidth);
  lineWidthRef.current = lineWidth;

  // Interaction tracking refs
  const isMouseDownRef = useRef(false);
  const isErasingRef = useRef(false);
  const erasedInCurrentStroke = useRef(false);
  const isDrawingShapeRef = useRef(false);
  const shapeStartRef = useRef({ x: 0, y: 0 });
  const activeShapeRef = useRef(null);

  // Spatially responsive canvas sizing for desktop, tablet, and mobile portrait/landscape
  const getCanvasSize = useCallback(() => {
    const isMobile = window.innerWidth <= 768;
    const isPortrait = window.innerHeight > window.innerWidth;

    const topBarHeight = isMobile ? 48 : 56;
    const bottomDockHeight = isMobile ? 64 : 76;
    const paddingX = isMobile ? 12 : 40;
    const paddingY = isMobile ? 16 : 30;

    const availableWidth = Math.max(280, window.innerWidth - paddingX);
    const availableHeight = Math.max(200, window.innerHeight - topBarHeight - bottomDockHeight - paddingY);

    let width = availableWidth;
    let height = availableHeight;

    if (isPortrait && isMobile) {
      // In mobile portrait, optimize height (e.g. 3:4 ratio) so users have a spacious notepad
      const targetAspect = 3 / 4;
      height = Math.min(availableHeight, Math.floor(availableWidth / targetAspect));
      width = Math.min(availableWidth, Math.floor(height * targetAspect));
    } else {
      // In landscape and desktop, maintain standard 16:9 widescreen canvas
      const targetAspect = 16 / 9;
      height = Math.floor(width / targetAspect);
      if (height > availableHeight) {
        height = availableHeight;
        width = Math.floor(height * targetAspect);
      }
    }

    return { width: Math.floor(width), height: Math.floor(height) };
  }, []);

  // Update object configurations according to current tool
  const updateObjectsToolConfig = useCallback((targetTool) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const isSelect = targetTool === 'select';
    const isEraser = targetTool === 'eraser';

    canvas.forEachObject((obj) => {
      obj.perPixelTargetFind = true;
      obj.targetFindTolerance = 12;
      obj.selectable = isSelect;
      obj.evented = isSelect || isEraser;
    });
    canvas.requestRenderAll();
  }, []);

  // Push new state into history stack
  const saveHistory = useCallback((canvas) => {
    if (isSyncing.current || !canvas) return;
    const json = canvas.toJSON(['perPixelTargetFind', 'targetFindTolerance', 'selectable', 'evented']);
    
    // Discard any redo states ahead of current position
    const nextHistory = historyRef.current.slice(0, historyPos.current + 1);
    nextHistory.push(json);

    // Cap history at 50 entries
    if (nextHistory.length > 50) {
      nextHistory.shift();
    }

    historyRef.current = nextHistory;
    historyPos.current = nextHistory.length - 1;

    setCanUndo(historyPos.current > 0);
    setCanRedo(false);
  }, []);

  // Broadcast change and save to history
  const broadcastAndSave = useCallback((canvas) => {
    if (isSyncing.current || !canvas) return;
    saveHistory(canvas);

    if (socket) {
      const state = canvas.toJSON(['perPixelTargetFind', 'targetFindTolerance', 'selectable', 'evented']);
      socket.emit("whiteboard:update", { roomId, state });
      socket.emit("whiteboard:save-snapshot", { roomId, imageData: state, state });
    }
  }, [saveHistory, socket, roomId]);

  // Load a state JSON into the Fabric canvas
  const applyState = useCallback((state, shouldBroadcast = false) => {
    const canvas = fabricRef.current;
    if (!canvas || !state) return;

    isSyncing.current = true;
    canvas.loadFromJSON(state, () => {
      canvas.backgroundColor = bgDark;
      updateObjectsToolConfig(toolRef.current);
      canvas.requestRenderAll();
      isSyncing.current = false;

      if (shouldBroadcast && socket) {
        socket.emit("whiteboard:update", { roomId, state });
        socket.emit("whiteboard:save-snapshot", { roomId, imageData: state, state });
      }
    });
  }, [socket, roomId, updateObjectsToolConfig]);

  // ── 1. CANVAS INITIALIZATION ─────────────────────────────────
  useEffect(() => {
    const { width, height } = getCanvasSize();

    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: bgDark,
      isDrawingMode: true,
      selection: false,
      perPixelTargetFind: true,
      targetFindTolerance: 12,
    });
    fabricRef.current = canvas;

    // Default brush config
    canvas.freeDrawingBrush.color = colorRef.current;
    canvas.freeDrawingBrush.width = lineWidthRef.current;

    // Save initial blank canvas state
    const initialJSON = canvas.toJSON(['perPixelTargetFind', 'targetFindTolerance', 'selectable', 'evented']);
    historyRef.current = [initialJSON];
    historyPos.current = 0;
    setCanUndo(false);
    setCanRedo(false);

    // ── PATH / BRUSH EVENTS ──
    canvas.on('path:created', (e) => {
      if (isSyncing.current) return;
      if (e.path) {
        e.path.perPixelTargetFind = true;
        e.path.targetFindTolerance = 12;
      }
      broadcastAndSave(canvas);
    });

    // ── OBJECT MODIFIED (moved, resized, rotated in select mode) ──
    canvas.on('object:modified', () => {
      if (isSyncing.current) return;
      broadcastAndSave(canvas);
    });

    // ── SELECTION TRACKING ──
    const updateSelectionState = () => {
      setHasSelection(canvas.getActiveObjects().length > 0);
    };
    canvas.on('selection:created', updateSelectionState);
    canvas.on('selection:updated', updateSelectionState);
    canvas.on('selection:cleared', () => setHasSelection(false));

    // ── MOUSE / TOUCH / POINTER EVENT COORDINATION ──
    canvas.on('mouse:down', (options) => {
      if (isSyncing.current) return;
      isMouseDownRef.current = true;
      const pointer = canvas.getPointer(options.e);
      const activeTool = toolRef.current;

      // ERASER: single click erase or begin sweeping erase
      if (activeTool === 'eraser') {
        isErasingRef.current = true;
        erasedInCurrentStroke.current = false;
        const target = options.target || canvas.findTarget(options.e);
        if (target) {
          canvas.remove(target);
          canvas.requestRenderAll();
          erasedInCurrentStroke.current = true;
        }
        return;
      }

      // RECTANGLE: begin drag to size
      if (activeTool === 'rect') {
        isDrawingShapeRef.current = true;
        shapeStartRef.current = { x: pointer.x, y: pointer.y };
        const rect = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          originX: 'left',
          originY: 'top',
          width: 0,
          height: 0,
          fill: 'transparent',
          stroke: colorRef.current,
          strokeWidth: lineWidthRef.current,
          perPixelTargetFind: true,
          targetFindTolerance: 12,
          selectable: false,
          evented: false,
        });
        activeShapeRef.current = rect;
        canvas.add(rect);
        return;
      }

      // CIRCLE: begin drag to size
      if (activeTool === 'circle') {
        isDrawingShapeRef.current = true;
        shapeStartRef.current = { x: pointer.x, y: pointer.y };
        const circle = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          originX: 'center',
          originY: 'center',
          radius: 0,
          fill: 'transparent',
          stroke: colorRef.current,
          strokeWidth: lineWidthRef.current,
          perPixelTargetFind: true,
          targetFindTolerance: 12,
          selectable: false,
          evented: false,
        });
        activeShapeRef.current = circle;
        canvas.add(circle);
        return;
      }

      // TEXT: click to place editable text
      if (activeTool === 'text') {
        const text = new fabric.IText('Text here...', {
          left: pointer.x,
          top: pointer.y,
          fill: colorRef.current,
          fontSize: Math.max(18, lineWidthRef.current * 6),
          fontFamily: 'sans-serif',
          perPixelTargetFind: true,
          targetFindTolerance: 12,
          selectable: true,
          evented: true,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        text.selectAll();
        canvas.requestRenderAll();
        broadcastAndSave(canvas);
        setTool('select');
      }
    });

    canvas.on('mouse:move', (options) => {
      if (!isMouseDownRef.current || isSyncing.current) return;
      const pointer = canvas.getPointer(options.e);
      const activeTool = toolRef.current;

      // ERASER: drag/sweep across items to delete
      if (activeTool === 'eraser' && isErasingRef.current) {
        const target = options.target || canvas.findTarget(options.e);
        if (target) {
          canvas.remove(target);
          canvas.requestRenderAll();
          erasedInCurrentStroke.current = true;
        }
        return;
      }

      // RECTANGLE: interactive sizing
      if (activeTool === 'rect' && isDrawingShapeRef.current && activeShapeRef.current) {
        const shape = activeShapeRef.current;
        const startX = shapeStartRef.current.x;
        const startY = shapeStartRef.current.y;
        const w = Math.abs(pointer.x - startX);
        const h = Math.abs(pointer.y - startY);
        shape.set({
          left: Math.min(pointer.x, startX),
          top: Math.min(pointer.y, startY),
          width: Math.max(2, w),
          height: Math.max(2, h),
        });
        canvas.requestRenderAll();
        return;
      }

      // CIRCLE: interactive sizing
      if (activeTool === 'circle' && isDrawingShapeRef.current && activeShapeRef.current) {
        const shape = activeShapeRef.current;
        const startX = shapeStartRef.current.x;
        const startY = shapeStartRef.current.y;
        const radius = Math.max(2, Math.hypot(pointer.x - startX, pointer.y - startY) / 2);
        shape.set({
          left: (startX + pointer.x) / 2,
          top: (startY + pointer.y) / 2,
          radius,
        });
        canvas.requestRenderAll();
      }
    });

    canvas.on('mouse:up', () => {
      isMouseDownRef.current = false;
      const activeTool = toolRef.current;

      // ERASER: finish sweeping stroke, broadcast single batch update
      if (activeTool === 'eraser' && isErasingRef.current) {
        isErasingRef.current = false;
        if (erasedInCurrentStroke.current) {
          erasedInCurrentStroke.current = false;
          broadcastAndSave(canvas);
        }
        return;
      }

      // SHAPES: finalize rectangle or circle
      if (isDrawingShapeRef.current && activeShapeRef.current) {
        isDrawingShapeRef.current = false;
        const shape = activeShapeRef.current;

        // If user tapped without dragging, give a reasonable default size
        if (activeTool === 'rect' && (shape.width < 5 || shape.height < 5)) {
          shape.set({ width: 100, height: 70 });
        } else if (activeTool === 'circle' && shape.radius < 5) {
          shape.set({ radius: 45 });
        }

        shape.set({ selectable: true, evented: true });
        shape.setCoords();
        canvas.setActiveObject(shape);
        canvas.requestRenderAll();
        broadcastAndSave(canvas);
        activeShapeRef.current = null;
        setTool('select');
      }
    });

    // ── KEYBOARD DELETE / BACKSPACE ──
    const handleKeyDown = (e) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const actives = canvas.getActiveObjects();
        if (actives.length > 0) {
          const isEditingText = actives.some(obj => obj.isEditing);
          if (isEditingText) return;

          e.preventDefault();
          actives.forEach(obj => canvas.remove(obj));
          canvas.discardActiveObject();
          canvas.requestRenderAll();
          setHasSelection(false);
          broadcastAndSave(canvas);
        }
      }
    };

    // ── WINDOW RESIZE & ORIENTATION ──
    const handleResize = () => {
      if (fabricRef.current) {
        const { width: newW, height: newH } = getCanvasSize();
        fabricRef.current.setWidth(newW);
        fabricRef.current.setHeight(newH);
        fabricRef.current.calcOffset();
        fabricRef.current.requestRenderAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [getCanvasSize, broadcastAndSave]);

  // ── 2. VISIBILITY RESIZE & RECALC ────────────────────────────
  useEffect(() => {
    if (isOpen && fabricRef.current) {
      const { width, height } = getCanvasSize();
      fabricRef.current.setWidth(width);
      fabricRef.current.setHeight(height);
      fabricRef.current.calcOffset();
      fabricRef.current.requestRenderAll();
    }
  }, [isOpen, getCanvasSize]);

  // ── 3. TOOL, COLOR & WIDTH SYNCHRONIZATION ───────────────────
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = (tool === 'pencil');
    canvas.selection = (tool === 'select');

    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = lineWidth;
    }

    updateObjectsToolConfig(tool);

    if (tool !== 'select') {
      canvas.discardActiveObject();
      setHasSelection(false);
      canvas.requestRenderAll();
    }

    // Dynamic cursors
    if (tool === 'eraser') {
      canvas.defaultCursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="%23ef4444" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>') 12 12, crosshair`;
      canvas.hoverCursor = canvas.defaultCursor;
    } else if (tool === 'pencil' || tool === 'rect' || tool === 'circle' || tool === 'text') {
      canvas.defaultCursor = 'crosshair';
      canvas.hoverCursor = 'crosshair';
    } else {
      canvas.defaultCursor = 'default';
      canvas.hoverCursor = 'move';
    }
  }, [tool, color, lineWidth, updateObjectsToolConfig]);

  // ── 4. SOCKET EVENT LISTENERS ────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (payload) => {
      const state = payload?.state || payload?.imageData;
      if (!state) return;
      applyState(state, false);

      const nextHistory = historyRef.current.slice(0, historyPos.current + 1);
      nextHistory.push(state);
      if (nextHistory.length > 50) nextHistory.shift();
      historyRef.current = nextHistory;
      historyPos.current = nextHistory.length - 1;
      setCanUndo(historyPos.current > 0);
      setCanRedo(false);
    };

    const handleClear = () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      isSyncing.current = true;
      canvas.clear();
      canvas.backgroundColor = bgDark;
      canvas.requestRenderAll();
      isSyncing.current = false;

      const blankJSON = canvas.toJSON(['perPixelTargetFind', 'targetFindTolerance', 'selectable', 'evented']);
      historyRef.current.push(blankJSON);
      historyPos.current = historyRef.current.length - 1;
      setCanUndo(historyPos.current > 0);
      setCanRedo(false);
    };

    socket.on("whiteboard:update", handleUpdate);
    socket.on("whiteboard:sync", handleUpdate);
    socket.on("whiteboard:clear", handleClear);

    socket.emit("whiteboard:request-sync", { roomId });

    return () => {
      socket.off("whiteboard:update", handleUpdate);
      socket.off("whiteboard:sync", handleUpdate);
      socket.off("whiteboard:clear", handleClear);
    };
  }, [socket, roomId, applyState]);

  // ── 5. USER ACTIONS ──────────────────────────────────────────
  const handleUndo = () => {
    if (historyPos.current > 0) {
      historyPos.current -= 1;
      const targetState = historyRef.current[historyPos.current];
      applyState(targetState, true);
      setCanUndo(historyPos.current > 0);
      setCanRedo(historyPos.current < historyRef.current.length - 1);
    }
  };

  const handleRedo = () => {
    if (historyPos.current < historyRef.current.length - 1) {
      historyPos.current += 1;
      const targetState = historyRef.current[historyPos.current];
      applyState(targetState, true);
      setCanUndo(historyPos.current > 0);
      setCanRedo(historyPos.current < historyRef.current.length - 1);
    }
  };

  const handleDeleteSelected = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const actives = canvas.getActiveObjects();
    if (actives.length > 0) {
      actives.forEach(obj => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      setHasSelection(false);
      broadcastAndSave(canvas);
    }
  };

  const handleClear = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = bgDark;
    canvas.requestRenderAll();
    broadcastAndSave(canvas);
    if (socket) {
      socket.emit("whiteboard:clear", { roomId });
    }
  };

  const handleExport = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: 'png', quality: 1 });
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="whiteboard-panel">
      {/* ── Top Bar: Title & Primary Actions (Close is always accessible at top-right) ── */}
      <header className="whiteboard-topbar">
        <div className="whiteboard-title-group">
          <h2 className="whiteboard-app-title">
            <span>🎨</span> Whiteboard
            <span className="badge">Live Sync</span>
          </h2>
        </div>

        <div className="whiteboard-topbar-actions">
          <Tooltip title="Undo" arrow>
            <span>
              <IconButton 
                onClick={handleUndo} 
                size="small" 
                disabled={!canUndo}
                sx={{ color: canUndo ? '#f1f5f9' : 'rgba(255,255,255,0.2)' }}
              >
                <UndoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Redo" arrow>
            <span>
              <IconButton 
                onClick={handleRedo} 
                size="small" 
                disabled={!canRedo}
                sx={{ color: canRedo ? '#f1f5f9' : 'rgba(255,255,255,0.2)' }}
              >
                <RedoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <div className="whiteboard-dock-divider" style={{ margin: '0 4px' }} />

          <Tooltip title={hasSelection ? "Delete Selected" : "Select an object to delete"} arrow>
            <IconButton 
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleDeleteSelected} 
              size="small"
              sx={{ 
                color: hasSelection ? '#ef4444' : 'rgba(255,255,255,0.3)',
                background: hasSelection ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Clear Board" arrow>
            <IconButton 
              onClick={handleClear} 
              size="small"
              sx={{ color: '#ef4444' }}
            >
              <LayersClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Save as PNG" arrow>
            <IconButton 
              onClick={handleExport} 
              size="small"
              sx={{ color: '#38bdf8' }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <div className="whiteboard-dock-divider" style={{ margin: '0 4px' }} />

          <Tooltip title="Close Whiteboard" arrow>
            <IconButton 
              onClick={onClose} 
              size="small" 
              sx={{ color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.08)' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </header>

      {/* ── Canvas Area: Responsive Middle Viewport ── */}
      <main className="whiteboard-canvas-wrapper" ref={wrapperRef}>
        <canvas ref={canvasRef} />
      </main>

      {/* ── Floating Tool Dock: Bottom Touch-Friendly Island ── */}
      <nav className="whiteboard-bottom-dock">
        {/* Drawing & Selection Tools */}
        <div className="whiteboard-tools-group">
          <Tooltip title="Draw (Pencil)" arrow>
            <IconButton 
              onClick={() => setTool('pencil')} 
              className={tool === 'pencil' ? 'active-tool' : ''}
              sx={{ color: tool === 'pencil' ? '#38bdf8' : 'rgba(255,255,255,0.75)' }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Eraser (Click or sweep over objects)" arrow>
            <IconButton
              onClick={() => setTool('eraser')}
              className={tool === 'eraser' ? 'active-tool' : ''}
              sx={{ color: tool === 'eraser' ? '#ef4444' : 'rgba(255,255,255,0.75)' }}
            >
              <DeleteSweepIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Rectangle (Drag to size)" arrow>
            <IconButton 
              onClick={() => setTool('rect')} 
              className={tool === 'rect' ? 'active-tool' : ''}
              sx={{ color: tool === 'rect' ? '#38bdf8' : 'rgba(255,255,255,0.75)' }}
            >
              <CropSquareIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Circle (Drag to size)" arrow>
            <IconButton 
              onClick={() => setTool('circle')} 
              className={tool === 'circle' ? 'active-tool' : ''}
              sx={{ color: tool === 'circle' ? '#38bdf8' : 'rgba(255,255,255,0.75)' }}
            >
              <RadioButtonUncheckedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Text (Click to type)" arrow>
            <IconButton 
              onClick={() => setTool('text')} 
              className={tool === 'text' ? 'active-tool' : ''}
              sx={{ color: tool === 'text' ? '#38bdf8' : 'rgba(255,255,255,0.75)' }}
            >
              <TextFieldsIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Select & Move (Click or drag over objects)" arrow>
            <IconButton 
              onClick={() => setTool('select')} 
              className={tool === 'select' ? 'active-tool' : ''}
              sx={{ color: tool === 'select' ? '#38bdf8' : 'rgba(255,255,255,0.75)' }}
            >
              <AdsClickIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>

        <div className="whiteboard-dock-divider" />

        {/* Color Palette & Custom Picker */}
        <div className="whiteboard-color-group">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`color-swatch ${color === c ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              title={`Color: ${c}`}
            />
          ))}

          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            title="Custom Color"
            className="whiteboard-custom-color"
          />
        </div>

        <div className="whiteboard-dock-divider" />

        {/* Brush Size Slider & Dot Preview */}
        <div className="whiteboard-brush-control">
          <input
            type="range"
            min="1" 
            max="25"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            title={`Stroke: ${lineWidth}px`}
          />
          <div className="brush-size-indicator" title={`Width: ${lineWidth}px`}>
            <div 
              className="brush-size-dot" 
              style={{ 
                width: Math.min(16, Math.max(3, lineWidth)), 
                height: Math.min(16, Math.max(3, lineWidth)),
                backgroundColor: color 
              }} 
            />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Whiteboard;
