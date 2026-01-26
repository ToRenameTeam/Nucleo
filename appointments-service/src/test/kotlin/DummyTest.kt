import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.should
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.startWith

// Remember to install kotest IntelliJ plugin from Marketplace! 🥰
class DummyTest : FunSpec({
    test("length should return size of string") {
        "hello".length shouldBe 5
    }
    test("startsWith should test for a prefix") {
        "hello world" should startWith("hello")
    }
})