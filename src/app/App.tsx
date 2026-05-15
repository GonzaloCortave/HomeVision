import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ReviewPageContainer from '../features/review/ReviewPageContainer'
import UploadDocumentPage from '../features/upload/UploadDocumentPage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<UploadDocumentPage />} path="/upload" />
        <Route element={<ReviewPageContainer />} path="/review/:reviewId" />
        <Route element={<Navigate replace to="/upload" />} path="/review" />
        <Route element={<Navigate replace to="/upload" />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}

export default App
