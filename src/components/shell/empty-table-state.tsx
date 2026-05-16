type EmptyTableStateProps = {
  message: string
}

export function EmptyTableState({ message }: EmptyTableStateProps) {
  return (
    <p className="py-6 text-center text-sm text-muted-foreground">{message}</p>
  )
}
