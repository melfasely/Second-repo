import {
  Box,
  Text,
  Heading,
  Image,
  Spinner,
  Flex,
  Button,
  Img,
  VStack,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getSubArticlesByArticle } from "../actions/subArticle";
import SuggestedArticles from "../components/suggestedArticles";
import { useDispatch, useSelector } from "react-redux";
import { getSubscriptionByClient } from "../actions/subscription";
import { getProducts } from "../actions/product";
import MokeUpArtciles from "../components/MokeUpArtciles";
import fetchArticleIdTeaser from "../services/api/artilcesAPI/fetchArticleIdTeaser";
import { getTrialByClient } from "../actions/trial";
import { FiCheck, FiFacebook, FiLinkedin, FiTwitter } from "react-icons/fi";

export default function Article() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { articleId } = useParams();

  const [article, setArticle] = useState(null);
  const [subArticles, setSubArticles] = useState([]);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(null);
  const [isTrial, setIsTrial] = useState(null);
  const [isAvailable, setIsAvailable] = useState(null);
  const [isLogged, setIsLogged] = useState(null);
  const [bodyTable, setBodyTable] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scroll, setScroll] = useState(0);
  const [progress, setProgress] = useState(0);

  // Theme colors from Redux store for dark/light mode
  const bg = useSelector((state) => state.themeReducer.backgroundColor1);
  const colorH = useSelector((state) => state.themeReducer.color1);
  const grayScales = useSelector((state) => state.themeReducer.grayScales);

  const access = useSelector((state) => state.auth.access);
  const userId = useSelector((state) => state.auth.user?.id);
  const role = useSelector((state) => state.auth.user?.role);
  const { subscriptions, loading } = useSelector((state) => state.subscriptionReducer);
  const trials = useSelector((state) => state.trialReducer.trials);
  const products = useSelector((state) => state.productReducer.products);

  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        const result = await fetchArticleIdTeaser(articleId);
        setArticle(result);
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoadingArticle(false);
      }
    };

    if (articleId) {
      fetchArticleData();
    }
  }, [articleId]);

  useEffect(() => {
    if (articleId) {
      const fetchSubArticles = async () => {
        try {
          const subArticlesResult = await dispatch(getSubArticlesByArticle(articleId));
          setSubArticles(subArticlesResult);
        } catch (error) {
          console.error("Error fetching sub-articles:", error);
        }
      };
      fetchSubArticles();
    }
  }, [articleId]);

  useEffect(() => {
    if (userId && access != null) {
      dispatch(getSubscriptionByClient(userId));
      dispatch(getProducts());
      dispatch(getTrialByClient(userId));
    }
  }, [userId, access]);

  useEffect(() => {
    if ((!isLoading && isAvailable && isSubscribed !== null && isTrial !== null) || isLogged === false) {
      let elem = document.getElementById("sugg").getBoundingClientRect().top + document.body.scrollTop;
      const el2 = document.getElementById("con").offsetHeight;
      window.addEventListener("scroll", () => {
        if (window.scrollY < elem - 580) setScroll(window.scrollY);
        setProgress((window.scrollY * 100) / (elem - 600));
      });
      window.addEventListener("resize", () => {
        elem = document.getElementById("sugg").getBoundingClientRect().top + document.body.scrollTop;
      });
    }
  }, [isAvailable, isLoading, isSubscribed, isTrial]);

  useEffect(() => {
    let sub = [];
    let tr = [];
    if (access !== null) {
      setIsLogged(true);
      if (subscriptions && products) {
        const exist = products.find((p) => /articl/i.test(p.title));
        setIsAvailable(!!exist);
        if (exist) {
          sub = subscriptions.find((s) => s.product === exist.id && s.is_active);
          tr = trials.find((s) => s.product === exist.id && s.is_active);
        }
        setIsSubscribed(!!sub);
        setIsTrial(!!tr);
      }
    } else {
      setIsLogged(false);
    }
    const idT = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearInterval(idT);
  }, [subscriptions, products, access]);

  useEffect(() => {
    if (article && article.body) setBodyTable(article.body.split(" "));
  }, [article]);

  if (loadingArticle) {
    return <Spinner size="xl" />;
  }

  if (isAvailable === false && !isLoading) return <MokeUpArtciles type="Not Available" />;

  return (!isLoading && isAvailable && isSubscribed !== null && isTrial !== null) || isLogged === false ? (
    <Box bgColor={bg} minH="100vh">
      <Box position="relative" overflow={"hidden"} id="con">
        <VStack id="socials" transition="ease 0.05s" position="absolute" top={`calc(50px + ${scroll}px)`} left="5%">
          <Flex direction="column" border="solid 1px black" borderRadius={"7px"}>
            <Box
              padding="10px"
              cursor={"pointer"}
              _hover={{ bgColor: "black", color: "white" }}
              onClick={() =>
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=XCapital`, "_blank")
              }
            >
              <FiTwitter fontSize="25px" />
            </Box>
            <Box
              padding="10px"
              cursor={"pointer"}
              _hover={{ bgColor: "black", color: "white" }}
              borderTop={"solid 1px black"}
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank")}
            >
              <FiFacebook fontSize="25px" />
            </Box>
            <Box
              padding="10px"
              cursor={"pointer"}
              _hover={{ bgColor: "black", color: "white" }}
              borderTop={"solid 1px black"}
              onClick={() =>
                window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=XCapital`, "_blank")
              }
            >
              <FiLinkedin fontSize="25px" />
            </Box>
          </Flex>
          <CircularProgress value={progress} size={"60px"}>
            <CircularProgressLabel display="flex" alignItems="center" justifyContent={"center"}>
              <FiCheck fontSize={"20px"} />
            </CircularProgressLabel>
          </CircularProgress>
        </VStack>
        <Box padding="20px" fontSize={{ base: "27px", md: "33px", lg: "38px" }} w="60%" ml="20%">
          <Heading color={colorH} mt={"25px"} fontFamily="Georgia, serif">
            {article.title}
          </Heading>
          <Text color={colorH} fontSize={{ base: "18px", md: "20px", lg: "24px" }} fontWeight="400" mt="20px" fontFamily="Georgia, serif">
            {article.sub_title}
          </Text>
        </Box>
        <Box w="60%" ml="20%" h="500px">
          <Image src={article.image_cover_url} borderRadius={"25px"} alt={article.title} width={"100%"} h="100%" objectFit="cover" />
        </Box>
        <Box as="section" padding={{ base: "24px", md: "32px", lg: "45px" }}>
          {isSubscribed || isTrial || role === "Admin" ? (
            <>
              <Text
                mt="30px"
                ml="17.5%"
                w="65%"
                color={colorH}
                fontSize={{ base: "18px", md: "20px", lg: "22px" }}
                lineHeight="1.8"
                mb="20px"
                fontFamily="Georgia, serif"
              >
                {bodyTable.slice(0, bodyTable.length).join(" ")}
              </Text>
              {subArticles.map((subArticle) => (
                <Box key={subArticle.id} mt="40px">
                  <Img src={subArticle.image} w={"60%"} ml={"20%"} borderRadius={"25px"} />
                  <Text
                    mt="20px"
                    ml="17.5%"
                    w="65%"
                    color={colorH}
                    fontSize={{ base: "18px", md: "20px", lg: "22px" }}
                    lineHeight="1.8"
                    mb="20px"
                    fontFamily="Georgia, serif"
                  >
                    {subArticle.body}
                  </Text>
                </Box>
              ))}
            </>
          ) : (
            <>
              <Box position="relative">
                <Text
                  padding={{ base: "10px", mg: "15px", lg: "25px" }}
                  backgroundImage="linear-gradient(180deg, black, lightgray)"
                  backgroundClip="text"
                  mt="30px"
                  ml="17.5%"
                  w="65%"
                  fontSize={{ base: "18px", md: "20px", lg: "22px" }}
                  lineHeight="1.8"
                  mb="20px"
                  fontFamily="Georgia, serif"
                >
                  {bodyTable.slice(0, 100).join(" ")}...
                </Text>
              </Box>
              <Button
                width="300px"
                height="70px"
                ml="calc(50% - 150px)"
                fontSize={{ base: "16px", md: "18px", lg: "20px" }}
                bgColor={grayScales}
                color={grayScales === "black" ? "white" : "black"}
                onClick={() => navigate(isLogged ? "" : "/login")}
              >
                {isLogged ? "Get Access Now" : "Login To Read The Full Article"}
              </Button>
            </>
          )}
        </Box>
      </Box>
      <SuggestedArticles category={article.category.id} id={article.id} />
    </Box>
  ) : (
    <Spinner size="xl" position="absolute" top="25%" left="50%" transform="translateY(-50%)" />
  );
}
