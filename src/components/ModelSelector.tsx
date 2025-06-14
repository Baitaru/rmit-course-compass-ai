
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain } from "lucide-react"
import { availableModels, type LLMModels } from "@/hooks/useLLM"

interface ModelSelectorProps {
  selectedModel: keyof LLMModels
  onModelChange: (model: keyof LLMModels) => void
}

export const ModelSelector = ({ selectedModel, onModelChange }: ModelSelectorProps) => {
  return (
    <div className="flex items-center gap-2 bg-card/50 rounded-lg px-3 py-2 border">
      <Brain className="h-4 w-4 text-primary" />
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-48 border-none shadow-none bg-transparent">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(availableModels).map(([key, name]) => (
            <SelectItem key={key} value={key}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
