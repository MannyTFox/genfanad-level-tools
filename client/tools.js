var TOOL_DEFINITIONS = {
    'default': {
        'move': {
            hotkey: 'M',
            name: 'Move',
            select: 'tile',
            on_select: (tile) => {}
        },
        'overhead': {
            hotkey: 'O',
            name: 'Camera Overhead',
            instant: () => {
                cameraLookAt(SCENE.camera, 64, 96, 68, 0,1,0, 64,0,64);

                SCENE.controls.target.set(64,20,64);
                SCENE.controls.update();
            }
        },
        'hotkeys': {
            instant: () => {
                TOOLS.printHotkeys();
            }
        },
        'model_editor': {
            hotkey: 'shift-P',
            name: "Open Model Editor",
            instant: () => {
                MODEL_EDITOR.openModelEditor();
            }
        },
    },
    'editor': {
        'undo': {
            hotkey: 'ctrl-',
            hotkey_human: 'ctrl+Z',
            name: "Undo",
            instant: () => {
                get('api/tools/undo/undo/' + WORKSPACES.opened, () => {
                    WORKSPACES.reload();
                });
            }
        },
        'redo': {
            hotkey: 'ctrl-',
            hotkey_human: 'ctrl+Y',
            name: "Redo",
            instant: () => {
                get('api/tools/undo/redo/' + WORKSPACES.opened, () => {
                    WORKSPACES.reload();
                });
            }
        },
        'copy': {
            'tool-config': {
                'tools-copy-choices': true,
            },
            name: 'Copy',
            select: 'area',
            hotkey: 'ctrl-C',
            on_select: (tile) => {
                let layers = {};
                for (let type of ['color', 'height', 'buildings', 'scenery']) {
                    if (document.getElementById('tools-copy-' + type).checked)
                        layers[type] = true;
                }
                post('api/tools/editor/copy/' + WORKSPACES.opened,{
                    selection: tile,
                    layers: layers,
                }, () => {
                    WORKSPACES.reload();
                });
            }
        },
        'cut': {
            'tool-config': {
                'tools-copy-choices': true,
            },
            name: 'Cut',
            select: 'area',
            hotkey: 'ctrl-X',
            on_select: (tile) => {
                let layers = {};
                for (let type of ['color', 'height', 'buildings', 'scenery']) {
                    if (document.getElementById('tools-copy-' + type).checked)
                        layers[type] = true;
                }
                post('api/tools/editor/cut/' + WORKSPACES.opened,{
                    selection: tile,
                    layers: layers,
                }, () => {
                    WORKSPACES.reload();
                });
            }
        },
        'paste': {
            'tool-config': {
                'tools-copy-choices': true,
            },
            name: 'Cut',
            select: 'fixed-area',
            hotkey: 'ctrl-V',
            init: () => {
                get('api/tools/editor/selection/' + WORKSPACES.opened, (data) => {
                    if (!data) {
                        TOOLS.pickTool('default','move');
                        return;
                    }
                    SELECTION.cursor.setDimensions(data.w, data.h);
                    //console.log("Selected: " + JSON.stringify(data));
                });
            },
            on_select: (tile) => {
                let layers = {};
                for (let type of ['color', 'height', 'buildings', 'scenery']) {
                    if (document.getElementById('tools-copy-' + type).checked)
                        layers[type] = true;
                }
                post('api/tools/editor/paste/' + WORKSPACES.opened,{
                    selection: tile,
                    layers: layers,
                }, () => {
                    WORKSPACES.reload();
                });
            }
        },
    },
    'color': {
        'save': {
            instant: () => {
                get('api/tools/mesh/color/save/' + WORKSPACES.opened);
            }
        },
        'load': {
            instant: () => {
                get('api/tools/mesh/color/load/' + WORKSPACES.opened, () => {
                    WORKSPACES.reload();
                });
            }
        },
    },
    'height': {
        'save': {
            instant: () => {
                get('api/tools/mesh/height/save/' + WORKSPACES.opened);
            }
        },
        'load': {
            instant: () => {
                get('api/tools/mesh/height/load/' + WORKSPACES.opened, () => {
                    WORKSPACES.reload();
                });
            }
        },
        'brush': {
            'tool-config': {
                'tools-detail-height': true,
            },
            name: 'Height Brush',
            select: 'fixed-area',
            hotkey: 'H',
            init: () => {
                updateHeightBrush();
            },
            on_select: (tile) => {
                let size = document.getElementById('tools-detail-height-size').value;
                let step = document.getElementById('tools-detail-height-step').value;
                let min = document.getElementById('tools-detail-height-min').value;
                let max = document.getElementById('tools-detail-height-max').value;

                let options = {
                    selection: tile,
                    size: Number(size),
                    step: Number(step),
                }
                if (min) options.min = min;
                if (max) options.max = max;

                console.log(JSON.stringify(options));

                post('api/tools/mesh/height/brush/' + WORKSPACES.opened, options, () => {
                    WORKSPACES.reload();
                });
            }
        },
    },
    'building': {
        'batch': {
            'tool-config': {
                'tools-detail-buildings-floors': true,
                'tools-detail-ground-batch': true,
            },
            name: 'Floors - Batch Edit',
            select: 'tile',
            on_select: (tile) => {
            },
        },
        'floor-tile': {
            'tool-config': {
                'tools-detail-buildings': true,
                'tools-detail-buildings-shape': true,
                'tools-detail-buildings-floors': true
            },
            name: 'Floors - Draw Tile',
            select: 'tile',
            hotkey: 'F',
            init: () => {
                SELECTION.swapCursorShape(document.getElementById('tools-detail-buildings-shape-list').value)
            },
            on_select: (tile) => {
                let level = document.getElementById('tools-detail-buildings-level').value;
                let shape = document.getElementById('tools-detail-buildings-shape-list').value;
                let type = document.getElementById('tools-detail-buildings-floor-list').value;

                post('api/tools/buildings/draw-floor/' + WORKSPACES.opened,{
                    selection: tile,
                    level: level, 
                    shape: shape,
                    type: type
                }, () => {
                    WORKSPACES.reload();
                });
            }
        },
        'floor-tile-select': {
            name: "Floors - Select Texture",
            hotkey: 'shift-F',
            instant: () => {
                TEXTURE_SELECTION.openBuildingSelection('tools-detail-buildings-floor-list');
            }
        },
        /*'floor-line': {
            'tool-config': {
                'tools-detail-buildings': true,
                'tools-detail-buildings-shape': true,
                'tools-detail-buildings-floors': true
            },
            name: 'Floors - Draw Line',
            select: 'line-tile',
            init: () => {
                SELECTION.showAdditionalCursor();
                SELECTION.swapCursorShape(document.getElementById('tools-detail-buildings-shape-list').value)
            },
            on_select: (tile) => {
                let level = document.getElementById('tools-detail-buildings-level').value;
                let shape = document.getElementById('tools-detail-buildings-shape-list').value;
                let type = document.getElementById('tools-detail-buildings-floor-list').value;

                post('api/tools/buildings/draw-floor/' + WORKSPACES.opened,{
                    selection: tile,
                    level: level, 
                    shape: shape,
                    type: type
                }, () => {
                    WORKSPACES.reload();
                });
            }
        },*/
        'floor-area': {
            'tool-config': {
                'tools-detail-buildings': true,
                'tools-detail-buildings-shape': true,
                'tools-detail-buildings-floors': true
            },
            name: 'Floors - Draw Area',
            select: 'area',
            hotkey: 'alt-F',
            on_select: (tile) => {
                let level = document.getElementById('tools-detail-buildings-level').value;
                let shape = document.getElementById('tools-detail-buildings-shape-list').value;
                let type = document.getElementById('tools-detail-buildings-floor-list').value;

                post('api/tools/buildings/draw-floor/' + WORKSPACES.opened,{
                    selection: tile,
                    level: level, 
                    shape: shape,
                    type: type
                }, () => {
                    WORKSPACES.reload();
                });
            }
        },
        'wall-line': {
            'tool-config': {
                'tools-detail-buildings': true,
                'tools-detail-buildings-walls': true
            },
            name: 'Walls - Draw Line',
            select: 'line',
            hotkey: 'W',
            on_select: (tile) => {
                let level = document.getElementById('tools-detail-buildings-level').value;
                let type = document.getElementById('tools-detail-buildings-wall-list').value;

                post('api/tools/buildings/draw-wall/' + WORKSPACES.opened,{
                    selection: tile,
                    level: level, 
                    type: type
                }, () => {
                    WORKSPACES.reload();
                });
            }
        },
        'wall-area': {
            'tool-config': {
                'tools-detail-buildings': true,
                'tools-detail-buildings-walls': true
            },
            name: 'Walls - Draw Square',
            select: 'area',
            hotkey: 'alt-W',
            on_select: (tile) => {
                let level = document.getElementById('tools-detail-buildings-level').value;
                let type = document.getElementById('tools-detail-buildings-wall-list').value;

                post('api/tools/buildings/draw-wall/' + WORKSPACES.opened,{
                    selection: tile,
                    level: level, 
                    type: type
                }, () => {
                    WORKSPACES.reload();
                });
            }
        },
        'wall-texture-select': {
            name: "Walls - Select Texture",
            hotkey: 'shift-W',
            instant: () => {
                TEXTURE_SELECTION.openBuildingSelection('tools-detail-buildings-wall-list');
            }
        },
        'roof-tile': {
            'tool-config': {
                'tools-detail-buildings': true,
                'tools-detail-buildings-shape': true,
                'tools-detail-buildings-roofs': true
            },
            name: 'Floors - Draw Roof',
            select: 'tile',
            hotkey: 'R',
            init: () => {
                SELECTION.swapCursorShape(document.getElementById('tools-detail-buildings-shape-list').value)
            },
            on_select: (tile) => {
                let level = document.getElementById('tools-detail-buildings-level').value;
                let shape = document.getElementById('tools-detail-buildings-shape-list').value;
                let type = document.getElementById('tools-detail-buildings-roof-list').value;

                post('api/tools/buildings/draw-roof/' + WORKSPACES.opened,{
                    selection: tile,
                    level: level, 
                    shape: shape,
                    type: type
                }, () => {
                    WORKSPACES.reload();
                });
            }
        },
        'roof-texture-select': {
            name: "Roof - Select Texture",
            hotkey: 'shift-R',
            instant: () => {
                TEXTURE_SELECTION.openBuildingSelection('tools-detail-buildings-roof-list');
            }
        },
        /*'roof-line': {
            'tool-config': {
                'tools-detail-buildings': true,
                'tools-detail-buildings-shape': true,
                'tools-detail-buildings-roofs': true
            },
            name: 'Roof - Draw Line',
            select: 'line-tile',
            init: () => {
                SELECTION.showAdditionalCursor();
                SELECTION.swapCursorShape(document.getElementById('tools-detail-buildings-shape-list').value)
            },
            on_select: (tile) => {
                let level = document.getElementById('tools-detail-buildings-level').value;
                let shape = document.getElementById('tools-detail-buildings-shape-list').value;
                let type = document.getElementById('tools-detail-buildings-roof-list').value;

                post('api/tools/buildings/draw-roof/' + WORKSPACES.opened,{
                    selection: tile,
                    level: level, 
                    shape: shape,
                    type: type
                }, () => {
                    WORKSPACES.reload();
                });
            }
        },*/
        'roof-area': {
            'tool-config': {
                'tools-detail-buildings': true,
                'tools-detail-buildings-shape': true,
                'tools-detail-buildings-roofs': true
            },
            name: 'Roofs - Draw Area',
            select: 'area',
            hotkey: 'alt-R',
            on_select: (tile) => {
                let level = document.getElementById('tools-detail-buildings-level').value;
                let shape = document.getElementById('tools-detail-buildings-shape-list').value;
                let type = document.getElementById('tools-detail-buildings-roof-list').value;

                post('api/tools/buildings/draw-roof/' + WORKSPACES.opened,{
                    selection: tile,
                    level: level, 
                    shape: shape,
                    type: type
                }, () => {
                    WORKSPACES.reload();
                });
            }
        },
        'clear-area': {
            'tool-config': {},
            name: 'Clear Area of Buildings',
            select: 'area',
            hotkey: 'Q',
            on_select: (tile) => {
                post('api/tools/buildings/clear-area/' + WORKSPACES.opened,{
                    selection: tile,
                }, () => {
                    WORKSPACES.reload();
                });
            }
        },
        'flatten-area': {
            'tool-config': {},
            name: 'Flatten Area',
            select: 'area',
            hotkey: 'T',
            on_select: (tile) => {
                post('api/tools/buildings/flatten-area/' + WORKSPACES.opened,{
                    selection: tile,
                }, () => {
                    WORKSPACES.reload();
                });
            }
        },
    },
    'scenery': {
        'select': {
            'tool-config': {
                'tools-detail-scenery-selected': true,
            },
            name: 'Scenery - Select',
            select: 'scenery',
            hotkey: 'S',
            on_select: (scenery) => {
                if (!scenery) return;
                if (scenery.type == 'scenery') {
                    SCENERY_EDITOR.selectScenery(scenery.id);
                } else if (scenery.type == 'unique') {
                    SCENERY_EDITOR.selectUniqueScenery(scenery.id);
                } else {
                    console.log("Clicked on " + JSON.stringify(scenery));
                }
            },
        },
        'place': {
            'tool-config': {
                'tools-detail-scenery-models': true,
                'tools-detail-scenery-customize': true,
            },
            name: 'Scenery - Place',
            select: 'tile',
            hotkey: 'P',
            init: () => {
                SCENERY_EDITOR.openPlacementTool();
                document.getElementById('tools-detail-scenery-rotation').innerText = 0;
            },
            dispose: () => {
                SCENERY_EDITOR.closePlacementTool();
            },
            on_select: (tile) => {
                SCENERY_EDITOR.placeModel(tile);
            }
        },
        'place-unique': {
            'tool-config': {
                'tools-detail-scenery-models': true,
            },
            name: 'Scenery - Place Unique',
            select: 'tile',
            init: () => {
            },
            dispose: () => {
            },
            on_select: (tile) => {
                SCENERY_EDITOR.placeUnique(tile);
            }
        },
        'batch': {
            'tool-config': {
                'tools-detail-scenery-batch': true,
            },
            name: 'Scenery - Batch Edit',
            select: 'tile',
            on_select: (tile) => {
            },
        },
    }
}

function batchAction(action) {
    post('api/tools/batch-scenery/' + action + '/' + WORKSPACES.opened,{
        prefix: document.getElementById('tools-detail-scenery-batch-prefix').value
    }, () => {
        WORKSPACES.reload();
    });
}

function batchFloorAction(action) {
    post('api/tools/batch-scenery/' + action + '/' + WORKSPACES.opened,{
        floor: document.getElementById('tools-detail-buildings-floor-list').value
    }, () => {
        WORKSPACES.reload();
    });
}

function updateHeightBrush() {
    if (TOOLS.selected.name != 'Height Brush') return;

    let s = document.getElementById('tools-detail-height-size').value;
    SELECTION.cursor.setDimensions(s,s, true);
}

function clearOption(id) {
    let dom = document.getElementById(id);
    dom.value = 'delete';
    dom.dispatchEvent(new Event("change"));
}

function copyCheck(b) {
    for (let type of ['color', 'height', 'buildings', 'scenery']) {
        document.getElementById('tools-copy-' + type).checked = b;
    }
}

class Tools {
    constructor() {
        this.selected = undefined;

        this.hotkeys = {};
        for (let type in TOOL_DEFINITIONS) {
            for (let tool in TOOL_DEFINITIONS[type]) {
                let t = TOOL_DEFINITIONS[type][tool];
                if (t.hotkey) {
                    this.hotkeys[t.hotkey] = [type, tool];
                }
            }
        }
    }

    pickTool(type, tool) {
        if (!TOOL_DEFINITIONS[type]) throw "Invalid tool type: " + type;
        if (!TOOL_DEFINITIONS[type][tool]) throw "Invalid tool " + tool + " for type " + type;

        let t = TOOL_DEFINITIONS[type][tool];

        if (t.instant) {
            t.instant();
            return;
        }

        if (this.selected && this.selected.dispose) {
            this.selected.dispose();
        }

        this.selected = t;
        document.getElementById('tool-selected').innerText = this.selected.name;

        for (let i of document.getElementById('tools-detail').childNodes) {
            if (i.id) {
                if (t['tool-config']) {
                    i.style.display = t['tool-config'][i.id] ? 'block' : 'none';
                } else {
                    i.style.display = 'none';
                }
            }
        }

        if (t.select == 'tile') {
            SELECTION.setTileMode(t.on_select);
        } else if (t.select == 'line') {
            SELECTION.setLineMode(t.on_select);
        } else if (t.select == 'area') {
            SELECTION.setAreaMode(t.on_select);
        } else if (t.select == 'fixed-area') {
            SELECTION.setFixedAreaMode(t.on_select);
        } else if (t.select == 'scenery') {
            SELECTION.setSceneryMode(t.on_select);
        }

        if (t.init) t.init();
    }

    init() {
    }

    keyPress(event) {
        if (!event.key) return;
        let letter = event.key.toUpperCase();
        if (event.shiftKey) letter = 'shift-' + letter;
        if (event.altKey) letter = 'alt-' + letter;
        if (event.ctrlKey) letter = 'ctrl-' + letter;

        console.log("Pressed " + letter);
        if (this.hotkeys[letter]) {
            this.pickTool(...this.hotkeys[letter]);
        }
    }

    printHotkeys() {
        let message = "";
        for (let i in this.hotkeys) {
            let key = TOOL_DEFINITIONS[this.hotkeys[i][0]][this.hotkeys[i][1]].hotkey_human || i;
            message += key + ": " +  TOOL_DEFINITIONS[this.hotkeys[i][0]][this.hotkeys[i][1]].name + "\n"; 
        }
        alert(message);
    }
}

var TOOLS = new Tools();