package com.dms.service;

import com.dms.dto.CreateForumPointRequest;
import com.dms.dto.ForumPointDTO;
import com.dms.dto.ForumTopicDTO;
import com.dms.entity.ForumPoint;
import com.dms.entity.ForumTopic;
import com.dms.repository.ForumPointRepository;
import com.dms.repository.ForumTopicRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumTopicRepository topicRepository;
    private final ForumPointRepository pointRepository;

    private static final String[] COLORS = {
        "border-blue-400 bg-blue-500/10",
        "border-emerald-400 bg-emerald-500/10",
        "border-amber-400 bg-amber-500/10",
        "border-violet-400 bg-violet-500/10",
        "border-rose-400 bg-rose-500/10"
    };

    @PostConstruct
    @Transactional
    public void seedDefaultTopics() {
        if (topicRepository.count() > 0) return;

        ForumTopic voting = saveTopic(
            "This house would make voting compulsory",
            "English",
            "Civics",
            "Discuss whether democratic participation should be a legal duty."
        );
        saveTopic(
            "Artificial intelligence should be regulated like medicine",
            "English",
            "Technology",
            "Balance innovation, public safety, accountability, and access."
        );
        ForumTopic phones = saveTopic(
            "பள்ளிகளில் கைப்பேசி பயன்பாட்டை தடை செய்ய வேண்டுமா?",
            "தமிழ்",
            "கல்வி",
            "கற்றல் கவனம், பாதுகாப்பு, மற்றும் டிஜிட்டல் திறன் குறித்து விவாதிக்கவும்."
        );
        saveTopic(
            "தமிழ் இலக்கியம் நவீன தொழில்நுட்பத்துடன் இணைக்கப்பட வேண்டுமா?",
            "தமிழ்",
            "மொழி",
            "பாரம்பரியம், அணுகல், மற்றும் புதிய தலைமுறை வாசிப்பு பழக்கங்கள்."
        );
        saveTopic(
            "Universities should prioritize skills over exams",
            "English",
            "Education",
            "Compare practical ability, fairness, grading, and employability."
        );
        saveTopic(
            "சுற்றுச்சூழல் பாதுகாப்புக்கு தனிநபர் பொறுப்பே முக்கியமா?",
            "தமிழ்",
            "சுற்றுச்சூழல்",
            "அரசு கொள்கை, தொழில், மற்றும் மக்களின் தினசரி தேர்வுகள்."
        );

        ForumPoint votingPoint = savePoint(voting, ForumPoint.Side.PROPOSITION, "Anjali", ForumPoint.Role.DEBATER,
            "Compulsory voting makes elected leaders answerable to a wider public, not only the most motivated groups.", null);
        savePoint(voting, ForumPoint.Side.OPPOSITION, "Kavin", ForumPoint.Role.JUDGE,
            "A forced vote may increase turnout numbers but reduce the quality of democratic choice if people vote without interest.", votingPoint);

        ForumPoint phonePoint = savePoint(phones, ForumPoint.Side.PROPOSITION, "Meena", ForumPoint.Role.ORGANIZER,
            "கைப்பேசி தடை மாணவர்களின் கவனச்சிதறலை குறைத்து வகுப்பறை ஒழுங்கை மேம்படுத்தும்.", null);
        savePoint(phones, ForumPoint.Side.OPPOSITION, "Suren", ForumPoint.Role.DEBATER,
            "முழு தடை விட, பொறுப்பான பயன்பாட்டை கற்பிப்பதே மாணவர்களுக்கு நீண்டகால பயன் தரும்.", phonePoint);
    }

    public List<ForumTopicDTO> getTopics() {
        return topicRepository.findAllByOrderByCreatedAtAsc()
            .stream()
            .map(this::toTopicDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public ForumPointDTO addPoint(Long topicId, CreateForumPointRequest request) {
        ForumTopic topic = topicRepository.findById(topicId)
            .orElseThrow(() -> new RuntimeException("Forum topic not found"));
        ForumPoint taggedPoint = null;
        if (request.getTaggedPointId() != null) {
            taggedPoint = pointRepository.findById(request.getTaggedPointId())
                .orElseThrow(() -> new RuntimeException("Tagged point not found"));
            if (!taggedPoint.getTopic().getId().equals(topicId)) {
                throw new RuntimeException("Tagged point must belong to the same forum topic");
            }
        }

        ForumPoint.Side side = ForumPoint.Side.valueOf(request.getSide().toUpperCase());
        ForumPoint.Role role = ForumPoint.Role.valueOf(request.getRole().toUpperCase());
        return ForumPointDTO.from(savePoint(topic, side, request.getAuthorName(), role, request.getContent(), taggedPoint));
    }

    private ForumTopicDTO toTopicDTO(ForumTopic topic) {
        List<ForumPointDTO> points = pointRepository.findByTopicOrderByCreatedAtAsc(topic)
            .stream()
            .map(ForumPointDTO::from)
            .collect(Collectors.toList());
        return ForumTopicDTO.from(topic, points);
    }

    private ForumTopic saveTopic(String title, String language, String category, String summary) {
        return topicRepository.save(ForumTopic.builder()
            .title(title)
            .language(language)
            .category(category)
            .summary(summary)
            .build());
    }

    private ForumPoint savePoint(ForumTopic topic, ForumPoint.Side side, String authorName, ForumPoint.Role role,
                                 String content, ForumPoint taggedPoint) {
        String color = COLORS[(int) (pointRepository.countByTopic(topic) % COLORS.length)];
        return pointRepository.save(ForumPoint.builder()
            .topic(topic)
            .side(side)
            .authorName(authorName.trim().isEmpty() ? "Guest Speaker" : authorName.trim())
            .role(role)
            .colorClass(color)
            .content(content.trim())
            .taggedPoint(taggedPoint)
            .build());
    }
}
