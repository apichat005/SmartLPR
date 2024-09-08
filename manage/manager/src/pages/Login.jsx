import { Button, TextField } from "office-ui-fabric-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Login() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const headerLogin = () => {
        var url = import.meta.env.VITE_API + '/login'
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        }).then(res => res.json())
            .then(data => {
                if (data.status == 200) {
                    sessionStorage.setItem('token', data.token)
                    sessionStorage.setItem('data', JSON.stringify(data.account))
                    navigate('/main')
                }
            })
    }

    useEffect(() => {
        if (sessionStorage.getItem('token')) {
            navigate('/main')
        }
    }, [])

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{
                    maxWidth: 350, width: 350, padding: 30, borderRadius: 5, backgroundColor: 'white',
                    boxShadow: '0 0 5px rgba(0,0,0,0.1)',
                }}>
                    <div
                        style={{
                            fontSize: 24,
                            fontWeight: 400,
                        }}
                    >เข้าสู่ระบบ</div>
                    กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ
                    <div style={{ marginTop: 10 }}>
                        <TextField label="ชื่อผู้ใช้งาน"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField label="รหัสผ่าน" type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button primary style={{ width: '100%', marginTop: 20, height: 40 }}
                            onClick={headerLogin}
                        >
                            เข้าสู่ระบบ
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}