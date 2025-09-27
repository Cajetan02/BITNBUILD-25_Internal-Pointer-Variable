import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  FileText, Upload, CheckCircle, Clock, AlertCircle, 
  CreditCard, Smartphone, Key, Download, Send,
  ArrowRight, RefreshCw, Eye, Edit, Shield
} from 'lucide-react';

const StepIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        
        return (
          <React.Fragment key={stepNumber}>
            <div className="flex flex-col items-center">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  isCompleted ? 'bg-green-500' : 
                  isCurrent ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? <CheckCircle className="w-5 h-5" /> : stepNumber}
              </motion.div>
              <span className="text-xs mt-2 text-center max-w-20">
                {stepNumber === 1 && 'Upload'}
                {stepNumber === 2 && 'Verify'}
                {stepNumber === 3 && 'Compute'}
                {stepNumber === 4 && 'File'}
                {stepNumber === 5 && 'Confirm'}
              </span>
            </div>
            {stepNumber < totalSteps && (
              <div className={`flex-1 h-1 mx-2 ${
                stepNumber < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const VerificationMethod = ({ method, selected, onSelect }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(method.id)}
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
        selected === method.id 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
          : 'border-border hover:border-blue-300'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${method.color}`}>
          <method.icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold">{method.name}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{method.description}</p>
      <div className="flex items-center gap-2 mt-2">
        <Badge variant="outline" className="text-xs">{method.time}</Badge>
        <Badge variant={method.secure ? 'default' : 'secondary'} className="text-xs">
          {method.secure ? 'Highly Secure' : 'Secure'}
        </Badge>
      </div>
    </motion.div>
  );
};

export default function AutoFiling() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVerification, setSelectedVerification] = useState('aadhaar');
  const [isProcessing, setIsProcessing] = useState(false);
  const [filingData, setFilingData] = useState({
    pan: 'ABCDE1234F',
    income: '₹12,00,000',
    deductions: '₹1,90,000',
    taxLiability: '₹1,72,500',
    refund: '₹8,500'
  });

  const verificationMethods = [
    {
      id: 'aadhaar',
      name: 'Aadhaar OTP',
      description: 'Verify using your Aadhaar number and OTP',
      icon: Smartphone,
      color: 'bg-blue-500',
      time: '2 minutes',
      secure: true
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'Login with your bank credentials',
      icon: CreditCard,
      color: 'bg-green-500',
      time: '3 minutes',
      secure: true
    },
    {
      id: 'digital',
      name: 'Digital Signature',
      description: 'Use your registered digital signature',
      icon: Key,
      color: 'bg-purple-500',
      time: '1 minute',
      secure: true
    }
  ];

  const handleNextStep = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      setIsProcessing(false);
    }, 2000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Upload Tax Documents</CardTitle>
                <p className="text-sm text-muted-foreground">
                  We've automatically gathered most of your data. Please review and upload any missing documents.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Form 16</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Automatically imported from employer</p>
                  </div>
                  
                  <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Investment Proofs</span>
                    </div>
                    <p className="text-sm text-muted-foreground">80C deductions detected</p>
                  </div>
                  
                  <div className="p-4 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <span className="font-medium">Bank Statements</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Upload for interest verification</p>
                    <Button size="sm" variant="outline" className="mt-2">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  
                  <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Eye className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">Review & Confirm</span>
                    </div>
                    <p className="text-sm text-muted-foreground">All documents ready</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Choose Verification Method</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select how you'd like to verify your identity for tax filing
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {verificationMethods.map((method) => (
                    <VerificationMethod
                      key={method.id}
                      method={method}
                      selected={selectedVerification}
                      onSelect={setSelectedVerification}
                    />
                  ))}
                </div>
                
                {selectedVerification === 'aadhaar' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="aadhaar">Aadhaar Number</Label>
                        <Input id="aadhaar" placeholder="1234 5678 9012" />
                      </div>
                      <div>
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input id="mobile" placeholder="+91 98765 43210" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Tax Computation Summary</CardTitle>
                <p className="text-sm text-muted-foreground">
                  AI has calculated your taxes. Please review before filing.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg">
                      <Label className="text-sm text-muted-foreground">Gross Total Income</Label>
                      <div className="text-2xl font-bold">{filingData.income}</div>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <Label className="text-sm text-muted-foreground">Total Deductions</Label>
                      <div className="text-2xl font-bold text-green-500">{filingData.deductions}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg">
                      <Label className="text-sm text-muted-foreground">Tax Liability</Label>
                      <div className="text-2xl font-bold text-red-500">{filingData.taxLiability}</div>
                    </div>
                    <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <Label className="text-sm text-muted-foreground">Expected Refund</Label>
                      <div className="text-2xl font-bold text-green-500">{filingData.refund}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Details
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Preview ITR
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Filing in Progress</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your tax return is being filed with the Income Tax Department
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <h3 className="text-lg font-semibold mb-2">Filing Your Return</h3>
                  <p className="text-muted-foreground mb-4">Please wait while we submit your ITR to the Income Tax Department</p>
                  <Progress value={75} className="w-full max-w-md mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Estimated time: 30 seconds</p>
                </div>
                
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your data is encrypted and transmitted securely to the IT Department using bank-level security protocols.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                  Tax Return Filed Successfully!
                </h2>
                
                <p className="text-muted-foreground mb-6">
                  Your ITR has been successfully submitted to the Income Tax Department.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Label className="text-sm text-muted-foreground">Acknowledgment Number</Label>
                    <div className="font-mono font-semibold">ITR-240312345678</div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Label className="text-sm text-muted-foreground">Filing Date</Label>
                    <div className="font-semibold">March 15, 2024</div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Label className="text-sm text-muted-foreground">Expected Refund</Label>
                    <div className="font-semibold text-green-500">{filingData.refund}</div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Label className="text-sm text-muted-foreground">Refund Timeline</Label>
                    <div className="font-semibold">45-60 days</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Download ITR-V
                  </Button>
                  <Button variant="outline">
                    <Send className="w-4 h-4 mr-2" />
                    Send to Email
                  </Button>
                  <Button variant="outline">
                    Track Refund Status
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Refund Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Refund Processing Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">ITR Filed Successfully</h4>
                      <p className="text-sm text-muted-foreground">March 15, 2024</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">Processing by IT Department</h4>
                      <p className="text-sm text-muted-foreground">15-30 days</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <h4 className="font-medium">Refund Issued</h4>
                      <p className="text-sm text-muted-foreground">45-60 days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-orange-500 rounded-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Auto-Filing & E-Verification</h1>
            <p className="text-muted-foreground">Hassle-free tax filing with AI assistance</p>
          </div>
        </div>
      </motion.div>

      {/* Step Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <StepIndicator currentStep={currentStep} totalSteps={5} />
      </motion.div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div key={currentStep}>
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Action Buttons */}
      {currentStep < 5 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex justify-center gap-4"
        >
          {currentStep > 1 && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
              disabled={isProcessing}
            >
              Previous
            </Button>
          )}
          
          <Button 
            onClick={handleNextStep}
            disabled={isProcessing}
            className="min-w-32"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {currentStep === 4 ? 'File Return' : 'Continue'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Error Handling */}
      {currentStep === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> Please verify all details carefully. Once filed, changes cannot be made without filing a revised return.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </div>
  );
}