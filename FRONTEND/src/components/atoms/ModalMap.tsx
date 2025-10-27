import React, { useState } from "react";
import { Button } from "./Button";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { InputGroup } from "../molecules/InputGroup";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface ModalMapProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  onSave?: (pins: { lat: number; lng: number }[]) => void;
  showSaveButton?: boolean;
  saveButtonText?: string;
}

function LocationMarker({ onAddPin }: { onAddPin: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onAddPin(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const ModalMap: React.FC<ModalMapProps> = ({
  isOpen,
  onClose,
  title = "Map",
  onSave,
  showSaveButton = true,
  saveButtonText = "Save",
}) => {
  const [pins, setPins] = useState<{ lat: number; lng: number }[]>([]);

  if (!isOpen) return null;

  const handleAddPin = (lat: number, lng: number) => {
    setPins((prev) => [...prev, { lat, lng }]);
  };

  const handleSave = () => {
    if (onSave) onSave(pins);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-2xl p-6 relative">
        <h2 className="text-xl font-bold mb-4">{title}</h2>

        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="muted"
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-black"
        >
          ✕
        </Button>

        {/* Map Container */}
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <InputGroup
                label="Effective Date"
                name="effectiveDate"
                id="effectiveDate"
                type="text"
              />
                <InputGroup
                label="Effective Date"
                name="effectiveDate"
                id="effectiveDate"
                type="text"
              />
              <InputGroup
                label="Effective Date"
                name="effectiveDate"
                id="effectiveDate"
                type="text"
              />
                <InputGroup
                label="Effective Date"
                name="effectiveDate"
                id="effectiveDate"
                type="text"
              />
            </div>
       
        {showSaveButton && (
          <div className="flex justify-end gap-3 mt-3.5">
            <Button
              onClick={onClose}
              className="px-4 py-2 rounded-md"
              variant="muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              className="px-4 py-2"
            >
              {saveButtonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalMap;
