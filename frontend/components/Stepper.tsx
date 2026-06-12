interface StepperProps {
  currentStep: number;
}

const steps = [
  "Upload",
  "Template",
  "Contacts",
  "Generate",
];

export default function Stepper({
  currentStep,
}: StepperProps) {
  return (
    <div className="flex justify-center gap-6">
      {steps.map((step, index) => {
        const active = currentStep >= index + 1;

        return (
          <div
            key={step}
            className={`font-semibold ${
              active
                ? "text-indigo-600"
                : "text-gray-400"
            }`}
          >
            {index + 1}. {step}
          </div>
        );
      })}
    </div>
  );
}