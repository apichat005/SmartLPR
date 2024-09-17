import {
    Field,
    Label,
    Input,
    Button,
    Toast,
} from "@fluentui/react-components";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";

export default function Line() {
    const [id, setId] = useState('')
    const [token, setToken] = useState('')
    const getLineToken = () => {
        axios.get(import.meta.env.VITE_API + '/lines', {
            headers: {
                Authorization: 'Bearer ' + sessionStorage.getItem('token')
            }
        })
            .then(data => {
                setId(data.data[0]._id)
                setToken(data.data[0].line_token)
            })
    }

    useEffect(() => {
        getLineToken()
    }, [])
    return (
        <>
            <div
                style={{
                    color: '#c50f1f',
                    fontSmooth: 'auto',
                    fontSize: 20,
                    fontWeight: 600,
                }}
            >
                กำหนด Line Notify
            </div>
            <div
                style={{
                    marginTop: 15
                }}
            >
                สามารถกำหนดได้สูงสุด 1 Token เท่านั้น
            </div>

            <div className="col-12 col-lg-4 mt-3">
                <Field>
                    <Label required>Token</Label>
                    <Input
                        placeholder="Token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
                </Field>
                <Button
                    appearance="primary"
                    style={{
                        marginTop: 10,
                        width: '100%'
                    }}
                    onClick={() => {
                        var formData = new FormData();
                        formData.append('id', id);
                        formData.append('line_token', token);
                        axios.post(import.meta.env.VITE_API + '/lines/update', formData, {
                            headers: {
                                Authorization: 'Bearer ' + sessionStorage.getItem('token')
                            }
                        })
                            .then(data => {
                                Swal.fire({
                                    icon: 'success',
                                    title: 'บันทึกสําเร็จ',
                                    showConfirmButton: false,
                                    timer: 1500
                                })
                            })
                    }}
                >
                    บันทึก
                </Button>
            </div>
        </>
    )
}
