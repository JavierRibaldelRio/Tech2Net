'use client'
import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { EyeOff, Eye } from "lucide-react"
import AlertState from "@/types/alert.type"



interface SignUpFormProps extends React.ComponentProps<"form"> {

    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    alert: AlertState;

}

export function SignUpForm({
    className,
    handleSubmit,
    alert,
    ...props
}: SignUpFormProps) {

    // To show or hide password
    const [isView, setIsView] = useState(false);


    const toggleView = () => setIsView(!isView);

    const eyesClass = "absolute right-4 top-1.5 z-10 cursor-pointer text-gray-500"

    return (
        <form className={cn("flex flex-col gap-3.5", className)} {...props} onSubmit={handleSubmit}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Regístrese</h1>
                {/* <p className="text-muted-foreground text-sm text-balance">
                    Enter your email below to login to your account
                </p> */}
            </div>
            <div className="grid gap-4">
                <div className="grid gap-1.5">
                    <Label htmlFor="username">Usuario</Label>
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        minLength={4}
                        maxLength={50}
                        placeholder="Su usuario" required />
                </div>

                <div className="grid gap-1.5">
                    <Label htmlFor="email">Nombre</Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        minLength={1}
                        maxLength={100}
                        placeholder="Su nombre" required />
                </div>

                <div className="grid gap-1.5">
                    <Label htmlFor="surnames">Apellidos</Label>
                    <Input id="surnames"
                        name="surnames"
                        type="text"
                        maxLength={255}
                        placeholder="Sus apellidos" required />
                </div>




                <div className="grid gap-1.5">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input id="email"
                        type="email"
                        name="email"
                        placeholder="su@correo.com" required />
                </div>


                {/* Contraseña */}
                <div className="grid gap-1.5">
                    <div className="flex items-center">
                        <Label htmlFor="password">Contraseña</Label>

                    </div>

                    <div className="relative">
                        <Input id="password"
                            name="password" type={isView ? "text" : "password"}
                            required />

                        {isView ? (
                            <Eye
                                className={eyesClass}
                                onClick={toggleView}
                            />
                        ) : (
                            <EyeOff
                                className={eyesClass}
                                onClick={toggleView}
                            />
                        )}

                    </div>


                </div>

                {/* Repetir contraseña */}
                <div className="grid gap-1.5">
                    <div className="flex items-center">
                        <Label htmlFor="password-again">Repita la contraseña</Label>

                    </div>

                    <Input id="password-again"
                        name="password-again" type="password"
                        required />
                </div>

                <Alert variant="destructive" hidden={alert.hidden}>
                    <AlertTitle>Error durante el registro</AlertTitle>
                    <AlertDescription>
                        {alert.text}
                    </AlertDescription>
                </Alert>

                <Button type="submit" className="w-full">
                    Registrarse
                </Button>

            </div>

        </form>
    )
}
