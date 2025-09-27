import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface DevOverlayProps {
  title: string;
  formula: string;
  source?: string;
  assumptions?: string[];
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const DevOverlay: React.FC<DevOverlayProps> = ({
  title,
  formula,
  source,
  assumptions = [],
  position = 'top',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 transform -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 transform -translate-y-1/2',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <Button
        variant="outline"
        size="icon"
        className="h-6 w-6 bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Info className="w-3 h-3" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Overlay Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`absolute z-50 ${positionClasses[position]}`}
            >
              <Card className="w-80 max-w-sm shadow-lg border-blue-200 bg-blue-50/95 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-blue-900">
                      Dev Note: {title}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-blue-600 hover:bg-blue-200"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div>
                    <p className="font-medium text-blue-900 mb-1">Formula:</p>
                    <code className="bg-white/70 px-2 py-1 rounded text-blue-800 block">
                      {formula}
                    </code>
                  </div>
                  
                  {assumptions.length > 0 && (
                    <div>
                      <p className="font-medium text-blue-900 mb-1">Assumptions:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        {assumptions.map((assumption, index) => (
                          <li key={index}>{assumption}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {source && (
                    <div>
                      <p className="font-medium text-blue-900 mb-1">Source:</p>
                      <p className="text-blue-800 italic">{source}</p>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-blue-700 text-xs">
                      This overlay shows calculation logic for demo purposes
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DevOverlay;