package com.staygenie.backend.controller;

import com.staygenie.backend.entity.Hotel;
import com.staygenie.backend.entity.Review;
import com.staygenie.backend.entity.User;
import com.staygenie.backend.repository.HotelRepository;
import com.staygenie.backend.repository.ReviewRepository;
import com.staygenie.backend.repository.UserRepository;
import com.staygenie.backend.service.SentimentAgent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SentimentAgent sentimentAgent;

    @GetMapping
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    @GetMapping("/hotel/{hotelId}")
    public List<Review> getReviewsByHotel(@PathVariable Long hotelId) {
        return reviewRepository.findByHotelId(hotelId);
    }

    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody Map<String, Object> request,
                                        Authentication authentication) {
        String email = (String) authentication.getPrincipal();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long hotelId = Long.valueOf(request.get("hotelId").toString());
        Integer rating = Integer.valueOf(request.get("rating").toString());
        String commentText = request.get("commentText").toString();

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        Review review = new Review();
        review.setHotel(hotel);
        review.setUser(user);
        review.setRating(rating);
        review.setCommentText(commentText);

        String sentiment = sentimentAgent.analyzeSentiment(commentText);
        review.setSentiment(sentiment);

        reviewRepository.save(review);

        return ResponseEntity.ok(Map.of(
                "message", "Review added successfully",
                "sentiment", sentiment
        ));
    }
}