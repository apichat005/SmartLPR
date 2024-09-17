import { useState } from 'react'
import { Button, Card, Field, Input, Label, Text } from '@fluentui/react-components'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const login = () => {
        if (email != '' && password != '') {
            fetch(import.meta.env.VITE_API_LOGIN + '/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: email,
                    password: password
                })
            }).then(res => res.json())
            .then(res => {
                sessionStorage.setItem('token', res.token)
                sessionStorage.setItem('data', JSON.stringify(res.account))
                navigate('/main')
            })
        } else {
            alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
        }
    }

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}
        >
            <Card
                style={{
                    width: 400,
                    margin: 'auto',
                    padding: 30,

                }}
            >
                <Text
                    style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        marginBottom: 2
                    }}
                >เข้าสู่ระบบ</Text>

                <Label>กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ</Label>

                <Field
                    label={'อีเมล'}
                >
                    <Input
                        label="อีเมล"
                        value={email}
                        appearance='outline'
                        onChange={(e) => setEmail(e.target.value)}
                    // placeholder='Please enter your email'
                    />
                </Field>

                <Field
                    label={'รหัสผ่าน'}
                    className='mt-2'
                >
                    <Input
                        label="รหัสผ่าน"
                        type="password"
                        value={password}
                        appearance='outline'
                        onChange={(e) => setPassword(e.target.value)}
                    // placeholder="Please enter your password"
                    />
                </Field>
                <Button onClick={login}
                    color='brand'
                    size="large"
                    appearance="primary"
                    className='mt-2'
                >เข้าสู่ระบบ</Button>
            </Card>
        </div>
    )
}