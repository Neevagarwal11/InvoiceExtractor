import { CheckCircle2, Zap, BarChart3, Lock } from "lucide-react"

export function TutorialSection() {
  const steps = [
    {
      number: 1,
      title: "Upload Your Invoice",
      description:
        "Simply drag and drop or click to upload your invoice in any format - PDF, image, or scanned document.",
      icon: Upload,
    },
    {
      number: 2,
      title: "AI Processes Data",
      description:
        "Our advanced AI instantly analyzes your invoice and extracts all relevant information with high accuracy.",
      icon: Zap,
    },
    {
      number: 3,
      title: "Review & Export",
      description:
        "Review the extracted data, make any corrections, and export in your preferred format - CSV, JSON, or Excel.",
      icon: BarChart3,
    },
    {
      number: 4,
      title: "Integrate & Automate",
      description:
        "Connect with your existing tools via API or use our pre-built integrations to automate your workflow.",
      icon: Lock,
    },
  ]

  const features = [
    {
      title: "High Accuracy",
      description: "Extracts invoice details with 99%+ accuracy using state-of-the-art AI models.",
    },
    {
      title: "Multiple Formats",
      description: "Supports PDF, images, scanned documents, and various invoice layouts.",
    },
    {
      title: "Secure & Private",
      description: "Your data is encrypted and processed securely. We never store your documents.",
    },
    {
      title: "Fast Processing",
      description: "Get results in seconds, not minutes. Process invoices at scale.",
    },
    {
      title: "Easy Integration",
      description: "RESTful API and webhooks for seamless integration with your systems.",
    },
    {
      title: "Batch Processing",
      description: "Upload multiple invoices at once and process them in parallel.",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        {/* How It Works */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in four simple steps. No technical knowledge required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative">
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-20 left-[60%] w-[calc(100%-60%)] h-0.5 bg-border" />
                  )}

                  <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                        {step.number}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Features Grid */}
        <div>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to streamline your invoice processing workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Import icons
import { Upload } from "lucide-react"
