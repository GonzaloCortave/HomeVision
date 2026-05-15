import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ReviewPageContainer from '../features/review/ReviewPageContainer'
import UploadDocumentPage from '../features/upload/UploadDocumentPage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ReviewPageContainer />} path="/" />
        <Route element={<ReviewPageContainer />} path="/review" />
        <Route element={<UploadDocumentPage />} path="/upload" />
        <Route element={<ReviewPageContainer />} path="/review/:reviewId" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}

export default App
