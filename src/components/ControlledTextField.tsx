import { TextField, TextFieldProps } from "@mui/material";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

export type ControlledTextFieldProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  helperText?: React.ReactNode;
} & Omit<TextFieldProps, "name" | "error" | "helperText">;

export function ControlledTextField<TFieldValues extends FieldValues>({
  name,
  control,
  ...props
}: ControlledTextFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...props}
          error={!!error}
          helperText={error ? error.message : props.helperText}
        />
      )}
    />
  );
}
