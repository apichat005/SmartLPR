import React, { useEffect, useState } from 'react';
import {
    Avatar,
    Card,
    Combobox,
    Checkbox,
    Input,
    Option,
    Label,
    Button,
    Tab,
    Table,
    TabList,
    TableHeader,
    TableRow,
    TableHeaderCell,
    TableBody,
    RatingItemProvider,
    Divider,
    Dropdown,
    Select,
    Field,
    useId,
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogTitle,
    DialogActions,
    DialogContent,
    DialogBody,
    Menu,
    MenuTrigger,
    MenuList,
    MenuItem,
    MenuPopover,
    Spinner
} from "@fluentui/react-components";
import { Route, Routes, useNavigate } from 'react-router-dom';
import { AddRegular, EditRegular, DeleteRegular, ListRegular, ArrowDownloadRegular, ArrowUploadRegular, FilterRegular, CalendarAddRegular, PersonAccountsFilled, ContactCardGroupFilled } from '@fluentui/react-icons'
import axios from 'axios';

export default function Account() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [total, setTotal] = useState(0)
    const [selectTab, setSelectTab] = useState('tab1')
    const [selectedOptions, setSelectedOptions] = useState([])
    const [keyword, setKeyword] = useState('')
    const [group, setGroup] = useState([])

    const getGroup = () => {
        axios.get(import.meta.env.VITE_API + '/role_group', {
            headers: {
                Authorization: 'Bearer ' + sessionStorage.getItem('token')
            }
        }).then((response) => {
            setGroup(response.data)
            setSelectedOptions(response.data.map((item) => item._id))
        }).catch((error) => {
            console.log(error)
        })
    }


    const handleOptionSelect = (event, data) => {
        setSelectedOptions(data.selectedOptions);
    };

    const [data, setData] = useState([])
    const getData = () => {
        axios.get(import.meta.env.VITE_API + `/accounts/${page}/${limit}`, {
            headers: {
                Authorization: 'Bearer ' + sessionStorage.getItem('token')
            },
        }).then((response) => {
            setTotal(response.total)
            setData(response.data.data)
        }).catch((error) => {
            console.log(error)
        })
    }

    const getSearchData = () => {
        var formData = new FormData()
        formData.append('group', selectedOptions)
        axios.post(import.meta.env.VITE_API + `/accounts/${page}/${limit}`, formData, {
            headers: {
                Authorization: 'Bearer ' + sessionStorage.getItem('token')
            },
        }).then((response) => {
            setTotal(response.total)
            setData(response.data.data)
        }).catch((error) => {
            console.log(error)
        })
    }


    useEffect(() => {
        getGroup()
        getData()
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
                บัญชีผู้ใช้
            </div>
            <TabList
                defaultSelectedValue={selectTab}
            >
                <Tab value="tab1" onClick={() => setSelectTab('tab1')} icon={<ListRegular />}><span>ข้อมูลทั้งหมด</span></Tab>
                <Menu>
                    <MenuTrigger disableButtonEnhancement>
                        <Button appearance='transparent' icon={<ArrowDownloadRegular />}>
                            <span>ดาวโหลด</span>
                        </Button>
                    </MenuTrigger>
                    <MenuPopover>
                        <MenuList>
                            <MenuItem
                                onClick={() => {
                                    window.open(import.meta.env.VITE_API + '/export/lpr_excel', '_blank')
                                }}
                            >CSV </MenuItem>
                        </MenuList>
                    </MenuPopover>
                </Menu>
                <Dialog>
                    <DialogTrigger>
                        <Button appearance='transparent' icon={<FilterRegular />}>
                            <span>ตัวกรอง</span>
                        </Button>
                    </DialogTrigger>
                    <DialogSurface
                        style={{
                            width: 400
                        }}
                    >
                        <DialogTitle>ตัวกรอง</DialogTitle>
                        <DialogContent>
                            <DialogBody
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Field label="กลุ่มผู้ใช้"
                                    style={{
                                        marginBottom: 10
                                    }}
                                >
                                    <Dropdown
                                        multiselect={true}
                                        selectedOptions={selectedOptions}
                                        onOptionSelect={handleOptionSelect}
                                        placeholder='เลือกกลุ่มผู้ใช้'

                                    >
                                        {group && group.map((item, index) => {
                                            return (
                                                <Option
                                                    key={index}
                                                    value={item._id}
                                                >
                                                    {item?.group_name}
                                                </Option>
                                            )
                                        })}
                                    </Dropdown>
                                </Field>
                            </DialogBody>
                            <DialogActions
                            >

                                <Button
                                    appearance='primary'
                                    onClick={() => {
                                        getSearchData()
                                    }}
                                    style={{
                                        width: '100%'
                                    }}
                                >
                                    ค้นหา
                                </Button>

                            </DialogActions>
                        </DialogContent>
                    </DialogSurface>
                </Dialog>
            </TabList>

            <div className="d-flex justify-content-between" style={{
                marginTop: 10
            }}>
                <div>
                    {
                        group && group.map((type, index) => {
                            if (selectedOptions.includes(type._id)) {
                                return (
                                    <Button
                                        key={index}
                                        appearance='primary'
                                        style={{
                                            fontSize: 12,
                                            marginRight: 5
                                        }}
                                        size='small'
                                    >
                                        {type.group_name}
                                    </Button>
                                )
                            }
                        })
                    }
                </div>
                <Input placeholder="ค้นหา"
                    onChange={(e) => {
                        setKeyword(e.target.value)
                    }}
                    style={{
                        width: 200,
                    }}
                />
            </div>
            <Table
                style={{
                    marginTop: 10
                }}
            >
                <TableHeader>
                    <TableRow>
                        <TableHeaderCell>รหัสผู้ใช้</TableHeaderCell>
                        <TableHeaderCell>ชื่อผู้ใช้</TableHeaderCell>
                        <TableHeaderCell>กลุ่มผู้ใช้</TableHeaderCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        data && data.map((item, index) => {
                            return (
                                <TableRow
                                    key={index}
                                >
                                    <TableHeaderCell>
                                        {item.a_code}
                                    </TableHeaderCell>
                                    <TableHeaderCell>
                                        {item.a_username}
                                    </TableHeaderCell>
                                    <TableHeaderCell>
                                        {item.role[0].group_name}
                                    </TableHeaderCell>
                                    <Dialog>
                                        <DialogTrigger>
                                            <Button appearance='transparent' icon={<EditRegular />} />
                                        </DialogTrigger>
                                        <DialogSurface
                                            style={{
                                                width: 400
                                            }}
                                        >
                                            <DialogTitle>แก้ไขข้อมูล</DialogTitle>
                                            <DialogContent>
                                                <DialogBody
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        marginBottom: 20
                                                    }}
                                                >
                                                    <Field label={'รหัสผู้ใช้'}>
                                                        <Input
                                                            value={item.a_code}
                                                            id={'a_code' + item._id}
                                                            onChange={(e) => {
                                                                item.a_code = e.target.value
                                                            }}
                                                        />
                                                    </Field>

                                                    <Field label={'ชื่อ-นามสกุล'}>
                                                        <Input
                                                            value={item.a_name}
                                                            id={'a_name' + item._id}
                                                            onChange={(e) => {
                                                                item.a_name = e.target.value
                                                            }}
                                                        />
                                                    </Field>

                                                    <Field label={'ชื่อผู้ใช้'}>
                                                        <Input
                                                            value={item.a_username}
                                                            id={'a_username' + item._id}
                                                            onChange={(e) => {
                                                                let temp = [...data];
                                                                temp[index] = { ...temp[index], a_username: e.target.value };
                                                                setData(temp);
                                                            }}
                                                        />
                                                    </Field>

                                                    <Field label={'กลุ่มผู้ใช้'}>
                                                        <Combobox
                                                            selectedKey={item.role[0]._id}
                                                            defaultValue={item.role[0].group_name}
                                                            id={'role' + item._id}
                                                            onOptionSelect={(e, key) => {
                                                                let temp = [...data];
                                                                temp[index] = { ...temp[index], a_role: key.optionValue };
                                                                setData(temp);
                                                            }}
                                                        >
                                                            {
                                                                group && group.map((type, index) => {
                                                                    return (
                                                                        <Option
                                                                            key={index}
                                                                            value={type._id}
                                                                        >
                                                                            {type.group_name}
                                                                        </Option>
                                                                    )
                                                                })
                                                            }
                                                        </Combobox>
                                                    </Field>

                                                    <Field
                                                        style={{
                                                            display: 'flex',
                                                        }}
                                                    >
                                                        <Checkbox
                                                            checked={item.first_ch_pass}
                                                            onChange={(e) => {
                                                                let temp = [...data];
                                                                temp[index] = { ...temp[index], first_ch_pass: e.target.checked }; // คัดลอก object ภายใน array และทำการแก้ไข
                                                                setData(temp);
                                                            }}
                                                            label="ตั้งรหัสผ่านใหม่หลังจากเข้าระบบครั้งแรก"
                                                        />
                                                    </Field>

                                                </DialogBody>
                                            </DialogContent>
                                            <DialogActions
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <DialogTrigger disableButtonEnhancement>
                                                    <Button appearance="subtle">ยกเลิก</Button>
                                                </DialogTrigger>
                                                <Button
                                                    appearance='primary'
                                                    onClick={() => {
                                                        var formData = new FormData()
                                                        formData.append('a_code', document.getElementById('a_code' + item._id).value)
                                                        formData.append('a_name', document.getElementById('a_name' + item._id).value)
                                                        formData.append('a_username', document.getElementById('a_username' + item._id).value)
                                                        formData.append('role', document.getElementById('role' + item._id).value)

                                                    }}
                                                >
                                                    บันทึก
                                                </Button>
                                            </DialogActions>
                                        </DialogSurface>
                                    </Dialog>
                                </TableRow>
                            )
                        })
                    }
                </TableBody>
            </Table>
        </>
    )
}