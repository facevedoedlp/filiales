import { useRef } from 'react';
import { Button } from '../common/Button';

export const ImageUploader = ({ onUpload, isUploading }) => {
  const fileInputRef = useRef(null);

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('imagen', file);
    onUpload?.(formData);
    event.target.value = '';
  };

  return (
    <div className="flex items-center gap-3">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
        Subir imagen
      </Button>
    </div>
  );
};

export default ImageUploader;
