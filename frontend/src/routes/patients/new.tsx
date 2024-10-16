import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/patients/new')({
  component: () => <div>Hello /patients/new!</div>,
})
