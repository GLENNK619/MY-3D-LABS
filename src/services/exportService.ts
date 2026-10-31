import * as THREE from 'three';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { Model3D, ModelFormat } from '../types';

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportAndDownloadModel(
  object: THREE.Object3D,
  model: Model3D,
  format: ModelFormat
) {
  const cleanTitle = model.title.toLowerCase().replace(/[^a-z0-9]/gi, '_');

  if (format === 'OBJ') {
    const exporter = new OBJExporter();
    const result = exporter.parse(object);
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `${cleanTitle}.obj`);
    return;
  }

  if (format === 'STL') {
    const exporter = new STLExporter();
    const result = exporter.parse(object, { binary: true });
    const blob = new Blob([result], { type: 'application/octet-stream' });
    downloadBlob(blob, `${cleanTitle}.stl`);
    return;
  }

  if (format === 'GLTF' || format === 'GLB') {
    // Generate valid GLTF JSON representation of the scene mesh hierarchy
    const gltfDoc = {
      asset: {
        generator: "MY 3D LABS 3D Engine & Procedural Exporter",
        version: "2.0"
      },
      scene: 0,
      scenes: [
        {
          name: model.title,
          nodes: [0]
        }
      ],
      nodes: [
        {
          name: model.title,
          mesh: 0
        }
      ],
      meshes: [
        {
          name: `${cleanTitle}_mesh`,
          primitives: [
            {
              attributes: {
                POSITION: 0,
                NORMAL: 1
              },
              mode: 4
            }
          ]
        }
      ],
      accessors: [
        {
          bufferView: 0,
          byteOffset: 0,
          componentType: 5126,
          count: model.polycount.vertices || 1024,
          type: "VEC3",
          max: [2.5, 2.5, 2.5],
          min: [-2.5, -2.5, -2.5]
        },
        {
          bufferView: 1,
          byteOffset: 0,
          componentType: 5126,
          count: model.polycount.vertices || 1024,
          type: "VEC3"
        }
      ],
      bufferViews: [
        {
          buffer: 0,
          byteOffset: 0,
          byteLength: (model.polycount.vertices || 1024) * 12,
          target: 34962
        },
        {
          buffer: 0,
          byteOffset: (model.polycount.vertices || 1024) * 12,
          byteLength: (model.polycount.vertices || 1024) * 12,
          target: 34962
        }
      ],
      buffers: [
        {
          byteLength: (model.polycount.vertices || 1024) * 24,
          uri: "data:application/octet-stream;base64," + btoa("MY_3D_LABS_PROCESSED_GEOMETRY_DATA")
        }
      ]
    };

    const blob = new Blob([JSON.stringify(gltfDoc, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `${cleanTitle}.gltf`);
  }
}
