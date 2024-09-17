import { useEffect, useState } from 'react'
import {
    BrowserRouter,
    Route,
    Routes,
    useNavigate,
    useLocation
} from 'react-router-dom'
import {
    DrawerBody,
    DrawerHeader,
    DrawerHeaderTitle,
    InlineDrawer,
    Drawer,
    makeStyles,
    mergeClasses,
    shorthands,
    tokens,
    Listbox,
    TabList,
    Tab,
    Button,
    Avatar
} from "@fluentui/react-components";
import Dashboard from './Dashboard';
import Lpr from './license-plate';
import Report from './report';
import Settings from './Settings';
import Logo from '../assets/logo.png'

export default function Main() {
    const navigate = useNavigate()
    var path = useLocation().pathname
    path = path.substring(6) ?? 'tab1'
    const [selectedTab, setSelectedTab] = useState(path)
    const [isOpen, setIsOpen] = useState(true)

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            setIsOpen(true)
        } else {
            setIsOpen(false)
        }
    })

    useEffect(() => {
        if (window.innerWidth >= 768) {
            setIsOpen(true)
        } else {
            setIsOpen(false)
        }
    }, [])


    return (

        <div
            style={{
                display: 'flex',
                padding: 0,
                // overflow: 'hidden',
            }}
        >
            <Drawer
                type={isOpen ? 'inline' : 'temporary'}
                separator
                position="start"
                open={isOpen}
                onOpenChange={(e, data) => setIsOpen(data.open)}
                style={{
                    width: '280px',
                    height: '100vh',
                    zIndex: 1000,
                    overflowY: 'hidden',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    transition: 'width 0.3s',
                }}
            >
                <DrawerBody>
                    <div
                        style={{ textAlign: 'center', marginBottom: 20 }}
                    >
                        {/* <Avatar name="John Doe" />
                        <span
                            style={{
                                marginLeft: 10,
                                fontSize: 16,
                            }}
                        >John Doe</span> */}
                        <img src={Logo} alt="logo"
                            style={{ width: 'auto', height: '80px' }}
                        />
                    </div>
                    <TabList
                        selectedTab={selectedTab}
                        vertical
                        size="large"
                        defaultSelectedValue={selectedTab}
                    >
                        <Tab value=""
                            onClick={() => navigate('/main/')}
                        >
                            <div>
                                หน้าหลัก
                            </div>
                        </Tab>
                        <Tab value="license-plate"
                            onClick={() => navigate('/main/license-plate')}
                        >
                            <div>
                                ป้ายทะเบียน
                            </div>
                        </Tab>
                        <Tab value="report"
                            onClick={() => navigate('/main/report')}
                        >
                            <div>
                                รายงาน
                            </div>
                        </Tab>
                        <Tab value="setting"
                            onClick={() => navigate('/main/setting')}
                        >
                            <div>
                                ตั้งค่า
                            </div>
                        </Tab>
                        <Tab value="tab5"
                            onClick={() => navigate('/')}
                        >
                            <div>
                                ออกจากระบบ
                            </div>
                        </Tab>
                    </TabList>


                </DrawerBody>
            </Drawer>

            <div
                style={{
                    width: isOpen ? 'calc(100vw - 280px)' : '100%',
                    marginLeft: isOpen ? '280px' : '0px',
                    transition: 'margin-left 0.3s',
                    objectFit: 'cover',
                    overflowX: 'hidden',
                    // overflowY: 'auto',
                    // height: '100vh',
                    height: 'calc(100vh - 40px)',
                    padding: 20,
                }}
            >

                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/license-plate" element={<Lpr />} />
                    <Route path="/report" element={<Report />} />
                    <Route path="/setting/*" element={<Settings />} />
                    <Route path="/tab5" element={<div>ออกจากระบบ</div>} />
                </Routes>
            </div>
        </div>
    )
}