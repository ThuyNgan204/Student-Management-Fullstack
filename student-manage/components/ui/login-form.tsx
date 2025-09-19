import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6 text-gray-100", className)} {...props}>
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-white">Login to your account</h1>
        <p className="text-gray-300 text-sm text-balance">
          Enter your credentials below to login
        </p>
      </div>

      {/* Role selection */}
      <div className="flex justify-center gap-6">
        <RadioGroup defaultValue="student" className="flex flex-row gap-6">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="admin" id="admin" />
            <Label htmlFor="admin" className="text-gray-200">Admin</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="teacher" id="teacher" />
            <Label htmlFor="teacher" className="text-gray-200">Teacher</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="student" id="student" />
            <Label htmlFor="student" className="text-gray-200">Student</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Inputs */}
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email" className="text-gray-200">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password" className="text-gray-200">Password</Label>
          <Input
            id="password"
            type="password"
            required
            className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
          />
        </div>

        {/* Remember me */}
        <div className="flex items-center space-x-2">
          <input
            id="remember"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
          />
          <Label htmlFor="remember" className="text-gray-200">
            Remember me
          </Label>
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
          Login
        </Button>

        {/* Forgot password */}
        <div className="flex justify-center">
          <a
            href="#"
            className="text-sm underline-offset-4 hover:underline text-gray-400 hover:text-gray-200"
          >
            Forgot your password?
          </a>
        </div>
      </div>
    </form>
  )
}
