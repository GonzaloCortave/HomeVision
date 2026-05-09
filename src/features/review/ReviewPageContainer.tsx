import { createReviewMock } from './data/reviewMock'
import ReviewPage from './ReviewPage'

const ReviewPageContainer = () => {
  const review = createReviewMock()

  return <ReviewPage review={review} />
}

export default ReviewPageContainer
